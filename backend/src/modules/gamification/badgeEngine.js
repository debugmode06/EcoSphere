const Badge = require('./models/Badge.model');
const ChallengeParticipation = require('./models/ChallengeParticipation.model');
const { notifyBadgeUnlocked } = require('../core/notificationService');

async function checkBadgeUnlocks(employee, session) {
  // Use try-catch or conditional check for EmployeeParticipation to prevent crashes if social module is not fully loaded
  let csrCount = 0;
  try {
    const EmployeeParticipation = require('../social/models/EmployeeParticipation.model');
    csrCount = await EmployeeParticipation.countDocuments({
      employee: employee._id,
      approvalStatus: 'APPROVED'
    }).session(session);
  } catch (err) {
    // Social module model not initialized/registered yet
  }

  const challengeCount = await ChallengeParticipation.countDocuments({
    employee: employee._id,
    approval: 'APPROVED'
  }).session(session);

  // Fetch all badges
  const allBadges = await Badge.find({}).session(session);

  const qualifyingBadgeIds = [];
  const qualifyingBadges = [];

  for (const badge of allBadges) {
    let qualifies = false;
    if (badge.unlockType === 'xp' && employee.xp >= badge.threshold) {
      qualifies = true;
    } else if (badge.unlockType === 'challengeCount' && challengeCount >= badge.threshold) {
      qualifies = true;
    } else if (badge.unlockType === 'csrCount' && csrCount >= badge.threshold) {
      qualifies = true;
    }

    if (qualifies) {
      qualifyingBadgeIds.push(badge._id);
      qualifyingBadges.push(badge);
    }
  }

  // Filter out badges already earned
  const newBadgeIds = qualifyingBadgeIds.filter(
    (id) => !employee.badges.some((existing) => existing.equals(id))
  );

  if (newBadgeIds.length) {
    employee.badges.push(...newBadgeIds);
    await employee.save({ session });

    // Send notifications for newly unlocked badges
    for (const badgeId of newBadgeIds) {
      const badge = qualifyingBadges.find((b) => b._id.equals(badgeId));
      if (badge) {
        try {
          notifyBadgeUnlocked(employee, badge);
        } catch (e) {
          console.error('Failed to send badge notification:', e);
        }
      }
    }
  }
}

module.exports = { checkBadgeUnlocks };
