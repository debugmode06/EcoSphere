const asyncHandler = require('../../utils/asyncHandler');
const gamificationService = require('./gamification.service');

// CHALLENGES
const createChallenge = asyncHandler(async (req, res) => {
  const challenge = await gamificationService.createChallenge(req.body);
  res.status(201).json(challenge);
});

const listChallenges = asyncHandler(async (req, res) => {
  // Service-level rule 1: Pass req.user for role filtering
  const challenges = await gamificationService.getChallenges(req.query, req.user);
  res.status(200).json(challenges);
});

const getChallengeById = asyncHandler(async (req, res) => {
  const challenge = await gamificationService.getChallengeById(req.params.id);
  if (!challenge) return res.status(404).json({ message: 'Challenge not found' });
  res.status(200).json(challenge);
});

const updateChallenge = asyncHandler(async (req, res) => {
  const challenge = await gamificationService.updateChallenge(req.params.id, req.body);
  if (!challenge) return res.status(404).json({ message: 'Challenge not found' });
  res.status(200).json(challenge);
});

const changeChallengeStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const challenge = await gamificationService.updateChallengeStatus(req.params.id, status);
  if (!challenge) return res.status(404).json({ message: 'Challenge not found' });
  res.status(200).json(challenge);
});

const deleteChallenge = asyncHandler(async (req, res) => {
  const challenge = await gamificationService.deleteChallenge(req.params.id);
  if (!challenge) return res.status(404).json({ message: 'Challenge not found' });
  res.status(200).json({ message: 'Challenge deleted successfully' });
});

// PARTICIPATION & PROOF
const joinChallenge = asyncHandler(async (req, res) => {
  const participation = await gamificationService.joinChallenge(req.params.id, req.user.id);
  res.status(201).json(participation);
});

const submitProof = asyncHandler(async (req, res) => {
  const { proofUrl } = req.body;
  const participation = await gamificationService.submitProof(req.params.id, req.user.id, proofUrl);
  res.status(200).json(participation);
});

const myParticipations = asyncHandler(async (req, res) => {
  const participations = await gamificationService.getParticipations({ employeeId: req.user.id }, req.user);
  res.status(200).json(participations);
});

const listParticipations = asyncHandler(async (req, res) => {
  // Service-level rule 8: Pass user context to filter by department for MANAGER
  const participations = await gamificationService.getParticipations(req.query, req.user);
  res.status(200).json(participations);
});

const approveParticipation = asyncHandler(async (req, res) => {
  const participation = await gamificationService.approveParticipation(req.params.id);
  res.status(200).json(participation);
});

const rejectParticipation = asyncHandler(async (req, res) => {
  const participation = await gamificationService.rejectParticipation(req.params.id);
  res.status(200).json(participation);
});

// BADGES
const createBadge = asyncHandler(async (req, res) => {
  const badge = await gamificationService.createBadge(req.body);
  res.status(201).json(badge);
});

const getBadges = asyncHandler(async (req, res) => {
  const badges = await gamificationService.getBadges();
  res.status(200).json(badges);
});

const updateBadge = asyncHandler(async (req, res) => {
  const badge = await gamificationService.updateBadge(req.params.id, req.body);
  if (!badge) return res.status(404).json({ message: 'Badge not found' });
  res.status(200).json(badge);
});

const deleteBadge = asyncHandler(async (req, res) => {
  const badge = await gamificationService.deleteBadge(req.params.id);
  if (!badge) return res.status(404).json({ message: 'Badge not found' });
  res.status(200).json({ message: 'Badge deleted successfully' });
});

// REWARDS
const createReward = asyncHandler(async (req, res) => {
  const reward = await gamificationService.createReward(req.body);
  res.status(201).json(reward);
});

const getRewards = asyncHandler(async (req, res) => {
  const rewards = await gamificationService.getRewards();
  res.status(200).json(rewards);
});

const updateReward = asyncHandler(async (req, res) => {
  const reward = await gamificationService.updateReward(req.params.id, req.body);
  if (!reward) return res.status(404).json({ message: 'Reward not found' });
  res.status(200).json(reward);
});

const deleteReward = asyncHandler(async (req, res) => {
  const reward = await gamificationService.deleteReward(req.params.id);
  if (!reward) return res.status(404).json({ message: 'Reward not found' });
  res.status(200).json({ message: 'Reward deleted successfully' });
});

const redeemReward = asyncHandler(async (req, res) => {
  const result = await gamificationService.redeemReward(req.user.id, req.params.id);
  res.status(200).json({
    message: 'Reward redeemed successfully',
    remainingPoints: result.employee.points,
    reward: result.reward
  });
});

// UNIFIED LEADERBOARD
const getLeaderboard = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
  
  let list = [];
  if (type === 'organization') {
    list = await gamificationService.getLeaderboardOrg(limit);
  } else if (type === 'department') {
    const deptId = req.query.department || req.user.department;
    if (!deptId) return res.status(400).json({ message: 'Department ID required' });
    list = await gamificationService.getLeaderboardDept(deptId, limit);
  } else if (type === 'monthly') {
    list = await gamificationService.getLeaderboardMonthly(limit);
  } else if (type === 'yearly') {
    list = await gamificationService.getLeaderboardYearly(limit);
  } else {
    return res.status(400).json({ message: 'Invalid leaderboard type' });
  }
  
  res.status(200).json(list);
});

module.exports = {
  createChallenge,
  listChallenges,
  getChallengeById,
  updateChallenge,
  changeChallengeStatus,
  deleteChallenge,
  joinChallenge,
  submitProof,
  myParticipations,
  listParticipations,
  approveParticipation,
  rejectParticipation,
  createBadge,
  getBadges,
  updateBadge,
  deleteBadge,
  createReward,
  getRewards,
  updateReward,
  deleteReward,
  redeemReward,
  getLeaderboard
};
