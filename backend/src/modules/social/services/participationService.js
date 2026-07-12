const Participation = require('../models/Participation');
const CsrActivity = require('../models/CSRActivity');
const Employee = require('../../auth/models/Employee.model');

const POPULATE_OPTS = [
  { path: 'employeeId', select: 'name email role department' },
  { path: 'csrActivityId', select: 'title location startDate endDate evidenceRequired status' },
  { path: 'approvedBy', select: 'name email role' },
];

async function joinActivity({ employeeId, csrActivityId }) {
  const activity = await CsrActivity.findById(csrActivityId);
  if (!activity) throw new Error('Activity not found');
  if (activity.status !== 'active') throw new Error('You can only join active activities');

  // Check if the activity is full
  const currentCount = await Participation.countDocuments({ csrActivityId });
  if (currentCount >= activity.maxParticipants) {
    throw new Error('Activity has reached maximum participant limit');
  }

  // Prevent duplicate joins
  const existing = await Participation.findOne({ employeeId, csrActivityId });
  if (existing) throw new Error('You have already joined this activity');

  const participation = new Participation({ employeeId, csrActivityId });
  await participation.save();
  return participation.populate(POPULATE_OPTS);
}

async function uploadProof({ participationId, employeeId, proofDocument }) {
  const participation = await Participation.findById(participationId);
  if (!participation) throw new Error('Participation record not found');
  if (participation.employeeId.toString() !== employeeId.toString()) {
    throw new Error('You can only upload proof for your own participation');
  }
  if (participation.status === 'approved') throw new Error('Participation already approved');
  if (participation.status === 'rejected') throw new Error('Participation was rejected. Cannot update proof.');

  participation.proofDocument = proofDocument;
  await participation.save();
  return participation.populate(POPULATE_OPTS);
}

async function approveParticipation({ id, approverId, remarks }) {
  const participation = await Participation.findById(id).populate('csrActivityId');
  if (!participation) throw new Error('Participation record not found');
  if (participation.status !== 'pending') {
    throw new Error(`Participation is already ${participation.status}`);
  }

  // ── CRITICAL BUSINESS RULE ──────────────────────────────────────────
  // If the linked CSR activity requires evidence, the proofDocument must
  // be present. If not, reject the approval with a clear 400 message.
  if (participation.csrActivityId.evidenceRequired && !participation.proofDocument) {
    const err = new Error('Evidence Required. Please upload proof before approval.');
    err.statusCode = 400;
    throw err;
  }
  // ────────────────────────────────────────────────────────────────────

  participation.status = 'approved';
  participation.approvedBy = approverId;
  participation.approvedDate = new Date();
  if (remarks) participation.remarks = remarks;
  await participation.save();

  // Award XP/points to the employee
  await Employee.findByIdAndUpdate(participation.employeeId, {
    $inc: { xp: 50, points: 100 },
  });

  return participation.populate(POPULATE_OPTS);
}

async function rejectParticipation({ id, approverId, remarks }) {
  const participation = await Participation.findById(id);
  if (!participation) throw new Error('Participation record not found');
  if (participation.status !== 'pending') {
    throw new Error(`Participation is already ${participation.status}`);
  }

  participation.status = 'rejected';
  participation.approvedBy = approverId;
  participation.approvedDate = new Date();
  if (remarks) participation.remarks = remarks;
  await participation.save();
  return participation.populate(POPULATE_OPTS);
}

async function getMyParticipations(employeeId) {
  return Participation.find({ employeeId })
    .populate(POPULATE_OPTS)
    .sort({ createdAt: -1 });
}

async function getPendingParticipations() {
  return Participation.find({ status: 'pending' })
    .populate(POPULATE_OPTS)
    .sort({ createdAt: -1 });
}

async function getActivityParticipants(csrActivityId) {
  return Participation.find({ csrActivityId })
    .populate(POPULATE_OPTS)
    .sort({ createdAt: -1 });
}

module.exports = {
  joinActivity, uploadProof,
  approveParticipation, rejectParticipation,
  getMyParticipations, getPendingParticipations, getActivityParticipants,
};
