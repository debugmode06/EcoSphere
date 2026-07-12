const mongoose = require('mongoose');
const Challenge = require('./models/Challenge.model');
const ChallengeParticipation = require('./models/ChallengeParticipation.model');
const Badge = require('./models/Badge.model');
const Reward = require('./models/Reward.model');
const Employee = require('../auth/models/Employee.model');
const { awardXP } = require('./xpEngine');
const { notify } = require('../core/notificationService');

// State Machine transitions graph for Challenge status
const ALLOWED_TRANSITIONS = {
  DRAFT: ['ACTIVE', 'ARCHIVED'],
  ACTIVE: ['UNDER_REVIEW', 'ARCHIVED'],
  UNDER_REVIEW: ['COMPLETED', 'ARCHIVED'],
  COMPLETED: ['ARCHIVED'],
  ARCHIVED: []
};

// CHALLENGE CRUD
async function createChallenge(data) {
  return await Challenge.create(data);
}

async function getChallenges(query = {}, user = {}) {
  const filter = {};
  if (query.difficulty) filter.difficulty = query.difficulty;
  if (query.category) filter.category = query.category;

  // Service-level rule 1: If user is EMPLOYEE, restrict to ACTIVE challenges only.
  if (user.role === 'EMPLOYEE') {
    filter.status = 'ACTIVE';
  } else {
    // Admin/Manager can view all or filter by status if specified in query
    if (query.status) filter.status = query.status;
  }

  return await Challenge.find(filter).populate('category');
}

async function getChallengeById(id) {
  return await Challenge.findById(id).populate('category');
}

async function updateChallenge(id, data) {
  // Service-level rule 2: Reject editing if challenge status is not DRAFT
  const challenge = await Challenge.findById(id);
  if (!challenge) return null;

  if (challenge.status !== 'DRAFT') {
    const error = new Error('Challenges cannot be edited once published');
    error.statusCode = 400;
    throw error;
  }

  return await Challenge.findByIdAndUpdate(id, data, { new: true }).populate('category');
}

async function deleteChallenge(id) {
  // Enforce delete only for DRAFT challenges
  const challenge = await Challenge.findById(id);
  if (!challenge) return null;

  if (challenge.status !== 'DRAFT') {
    const error = new Error('Only DRAFT challenges can be deleted');
    error.statusCode = 400;
    throw error;
  }

  return await Challenge.findByIdAndDelete(id);
}

// CHALLENGE PARTICIPATION
async function joinChallenge(challengeId, employeeId) {
  const challenge = await Challenge.findById(challengeId);
  if (!challenge) {
    const error = new Error('Challenge not found');
    error.statusCode = 404;
    throw error;
  }

  // Service-level rule 4: Reject if challenge is not ACTIVE
  if (challenge.status !== 'ACTIVE') {
    const error = new Error('Challenge is not active and cannot be joined');
    error.statusCode = 400;
    throw error;
  }

  // Reject if participation already exists (returns 409)
  const existing = await ChallengeParticipation.findOne({ challenge: challengeId, employee: employeeId });
  if (existing) {
    const error = new Error('You have already joined this challenge');
    error.statusCode = 409;
    throw error;
  }

  return await ChallengeParticipation.create({
    challenge: challengeId,
    employee: employeeId,
    progress: 0,
    approval: 'PENDING'
  });
}

async function submitProof(challengeId, employeeId, proofUrl) {
  const challenge = await Challenge.findById(challengeId);
  if (!challenge) {
    const error = new Error('Challenge not found');
    error.statusCode = 404;
    throw error;
  }

  // Service-level rule 5: Reject if evidenceRequired is false
  if (!challenge.evidenceRequired) {
    const error = new Error('Evidence proof is not required for this challenge');
    error.statusCode = 400;
    throw error;
  }

  const participation = await ChallengeParticipation.findOne({ challenge: challengeId, employee: employeeId });
  if (!participation) {
    const error = new Error('You have not joined this challenge');
    error.statusCode = 400;
    throw error;
  }

  // Reject if already approved
  if (participation.approval === 'APPROVED') {
    const error = new Error('Challenge already approved and completed');
    error.statusCode = 400;
    throw error;
  }

  participation.proofUrl = proofUrl;
  participation.progress = 100;
  participation.approval = 'PENDING';
  return await participation.save();
}

async function approveParticipation(participationId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const participation = await ChallengeParticipation.findById(participationId)
      .populate('challenge')
      .session(session);

    if (!participation) {
      const error = new Error('Participation record not found');
      error.statusCode = 404;
      throw error;
    }

    // Service-level rule 6: Only allowed if pending
    if (participation.approval !== 'PENDING') {
      const error = new Error('Only PENDING participations can be approved');
      error.statusCode = 400;
      throw error;
    }

    participation.approval = 'APPROVED';
    const xpToAward = participation.challenge.xp || 100;
    participation.xpAwarded = xpToAward;
    
    // Award XP inside the transaction session
    await awardXP(participation.employee, xpToAward, session);

    await participation.save({ session });
    await session.commitTransaction();

    // Trigger notification outside transaction
    try {
      notify('CHALLENGE_APPROVED', {
        employeeId: participation.employee,
        challengeTitle: participation.challenge.title,
        xpAwarded: xpToAward
      });
    } catch (err) {
      console.error('Notification failed:', err);
    }

    return participation;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

async function rejectParticipation(participationId) {
  const participation = await ChallengeParticipation.findById(participationId).populate('challenge');
  if (!participation) {
    const error = new Error('Participation record not found');
    error.statusCode = 404;
    throw error;
  }

  // Service-level rule 7: Only allowed if pending
  if (participation.approval !== 'PENDING') {
    const error = new Error('Only PENDING participations can be rejected');
    error.statusCode = 400;
    throw error;
  }

  participation.approval = 'REJECTED';
  await participation.save();

  // Trigger notification
  try {
    notify('CHALLENGE_REJECTED', {
      employeeId: participation.employee,
      challengeTitle: participation.challenge.title
    });
  } catch (err) {
    console.error('Notification failed:', err);
  }

  return participation;
}

async function updateChallengeStatus(id, newStatus) {
  if (!['DRAFT', 'ACTIVE', 'UNDER_REVIEW', 'COMPLETED', 'ARCHIVED'].includes(newStatus)) {
    const error = new Error('Invalid status');
    error.statusCode = 400;
    throw error;
  }

  const challenge = await Challenge.findById(id);
  if (!challenge) return null;

  // Service-level rule 3: Enforce allowed state transitions
  const currentStatus = challenge.status || 'DRAFT';
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    const error = new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    error.statusCode = 400;
    throw error;
  }

  challenge.status = newStatus;
  return await challenge.save();
}

async function getParticipations(query = {}, user = {}) {
  const filter = {};
  if (query.employeeId) filter.employee = query.employeeId;
  if (query.challengeId) filter.challenge = query.challengeId;
  if (query.approval) filter.approval = query.approval;
  
  // Service-level rule 8: If manager, restrict to their department only
  if (user.role === 'MANAGER') {
    const employees = await Employee.find({ department: user.department }).select('_id');
    const employeeIds = employees.map(e => e._id);
    filter.employee = { $in: employeeIds };
  }

  return await ChallengeParticipation.find(filter)
    .populate('challenge')
    .populate({
      path: 'employee',
      select: 'name email department',
      populate: { path: 'department', select: 'name' }
    });
}

// BADGE CRUD
async function createBadge(data) {
  return await Badge.create(data);
}

async function getBadges() {
  return await Badge.find({});
}

async function updateBadge(id, data) {
  return await Badge.findByIdAndUpdate(id, data, { new: true });
}

async function deleteBadge(id) {
  return await Badge.findByIdAndDelete(id);
}

// REWARD CRUD & REDEMPTION
async function createReward(data) {
  return await Reward.create(data);
}

async function getRewards() {
  return await Reward.find({});
}

async function updateReward(id, data) {
  return await Reward.findByIdAndUpdate(id, data, { new: true });
}

async function deleteReward(id) {
  return await Reward.findByIdAndDelete(id);
}

async function redeemReward(employeeId, rewardId) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const employee = await Employee.findById(employeeId).session(session);
    if (!employee) throw new Error('Employee not found');

    const reward = await Reward.findById(rewardId).session(session);
    if (!reward) throw new Error('Reward not found');

    if (reward.status !== 'Active') throw new Error('Reward is currently inactive');
    if (reward.stock <= 0) throw new Error('Reward out of stock');
    if (employee.points < reward.pointsRequired) throw new Error('Insufficient points');

    employee.points -= reward.pointsRequired;
    reward.stock -= 1;
    employee.redemptions.push({ reward: rewardId, redeemedAt: new Date() });

    await employee.save({ session });
    await reward.save({ session });

    await session.commitTransaction();

    try {
      notify('REWARD_REDEEMED', {
        employeeId: employee._id,
        rewardName: reward.name,
        pointsUsed: reward.pointsRequired
      });
    } catch (err) {
      console.error('Notification failed:', err);
    }

    return { employee, reward };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

// LEADERBOARD SERVICES
async function getLeaderboardOrg(limit = 10) {
  return await Employee.find({})
    .sort({ xp: -1 })
    .limit(limit)
    .populate('department')
    .select('name email xp points badges');
}

async function getLeaderboardDept(deptId, limit = 10) {
  return await Employee.find({ department: deptId })
    .sort({ xp: -1 })
    .limit(limit)
    .populate('department')
    .select('name email xp points badges');
}

async function getLeaderboardMonthly(limit = 10) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date();
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setDate(0);
  endOfMonth.setHours(23, 59, 59, 999);

  return await ChallengeParticipation.aggregate([
    {
      $match: {
        approval: 'APPROVED',
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      }
    },
    {
      $group: {
        _id: '$employee',
        xpEarned: { $sum: '$xpAwarded' },
        challengeCount: { $sum: 1 }
      }
    },
    { $sort: { xpEarned: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'employees',
        localField: '_id',
        foreignField: '_id',
        as: 'employeeDetails'
      }
    },
    { $unwind: '$employeeDetails' },
    {
      $lookup: {
        from: 'departments',
        localField: 'employeeDetails.department',
        foreignField: '_id',
        as: 'deptDetails'
      }
    },
    { $unwind: { path: '$deptDetails', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        xpEarned: 1,
        challengeCount: 1,
        'employeeDetails.name': 1,
        'employeeDetails.email': 1,
        'deptDetails.name': 1
      }
    }
  ]);
}

async function getLeaderboardYearly(limit = 10) {
  const startOfYear = new Date();
  startOfYear.setMonth(0, 1);
  startOfYear.setHours(0, 0, 0, 0);

  const endOfYear = new Date();
  endOfYear.setMonth(11, 31);
  endOfYear.setHours(23, 59, 59, 999);

  return await ChallengeParticipation.aggregate([
    {
      $match: {
        approval: 'APPROVED',
        createdAt: { $gte: startOfYear, $lte: endOfYear }
      }
    },
    {
      $group: {
        _id: '$employee',
        xpEarned: { $sum: '$xpAwarded' },
        challengeCount: { $sum: 1 }
      }
    },
    { $sort: { xpEarned: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'employees',
        localField: '_id',
        foreignField: '_id',
        as: 'employeeDetails'
      }
    },
    { $unwind: '$employeeDetails' },
    {
      $lookup: {
        from: 'departments',
        localField: 'employeeDetails.department',
        foreignField: '_id',
        as: 'deptDetails'
      }
    },
    { $unwind: { path: '$deptDetails', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        xpEarned: 1,
        challengeCount: 1,
        'employeeDetails.name': 1,
        'employeeDetails.email': 1,
        'deptDetails.name': 1
      }
    }
  ]);
}

module.exports = {
  createChallenge,
  getChallenges,
  getChallengeById,
  updateChallenge,
  deleteChallenge,
  joinChallenge,
  submitProof,
  approveParticipation,
  rejectParticipation,
  updateChallengeStatus,
  getParticipations,
  createBadge,
  getBadges,
  updateBadge,
  deleteBadge,
  createReward,
  getRewards,
  updateReward,
  deleteReward,
  redeemReward,
  getLeaderboardOrg,
  getLeaderboardDept,
  getLeaderboardMonthly,
  getLeaderboardYearly
};
