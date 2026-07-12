const participationService = require('../services/participationService');
const asyncHandler = require('../../../utils/asyncHandler');

const joinActivity = asyncHandler(async (req, res) => {
  const participation = await participationService.joinActivity({
    employeeId: req.user.id,
    csrActivityId: req.body.csrActivityId,
  });
  res.status(201).json({ message: 'Joined activity successfully', participation });
});

const uploadProof = asyncHandler(async (req, res) => {
  const participation = await participationService.uploadProof({
    participationId: req.body.participationId,
    employeeId: req.user.id,
    proofDocument: req.body.proofDocument,
  });
  res.status(200).json({ message: 'Proof uploaded successfully', participation });
});

const approveParticipation = asyncHandler(async (req, res) => {
  try {
    const participation = await participationService.approveParticipation({
      id: req.params.id,
      approverId: req.user.id,
      remarks: req.body.remarks,
    });
    res.status(200).json({ message: 'Participation approved', participation });
  } catch (err) {
    // Surface the 400 evidence-required error correctly
    if (err.statusCode === 400) {
      return res.status(400).json({ message: err.message });
    }
    throw err;
  }
});

const rejectParticipation = asyncHandler(async (req, res) => {
  const participation = await participationService.rejectParticipation({
    id: req.params.id,
    approverId: req.user.id,
    remarks: req.body.remarks,
  });
  res.status(200).json({ message: 'Participation rejected', participation });
});

const getMyParticipations = asyncHandler(async (req, res) => {
  const participations = await participationService.getMyParticipations(req.user.id);
  res.status(200).json({ participations });
});

const getPendingParticipations = asyncHandler(async (req, res) => {
  const participations = await participationService.getPendingParticipations();
  res.status(200).json({ participations });
});

const getActivityParticipants = asyncHandler(async (req, res) => {
  const participations = await participationService.getActivityParticipants(req.params.activityId);
  res.status(200).json({ participations });
});

module.exports = {
  joinActivity, uploadProof,
  approveParticipation, rejectParticipation,
  getMyParticipations, getPendingParticipations, getActivityParticipants,
};
