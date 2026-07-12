const router = require('express').Router();
const { protect, requireRole, requireOwnDepartmentOrAdmin } = require('../../middleware/auth');
const ctrl = require('./gamification.controller');

// ── STAGE 1-2: Admin-only lifecycle control ──
router.post('/challenges', protect, requireRole('ADMIN'), ctrl.createChallenge);
router.put('/challenges/:id', protect, requireRole('ADMIN'), ctrl.updateChallenge);
router.put('/challenges/:id/status', protect, requireRole('ADMIN'), ctrl.changeChallengeStatus);
router.delete('/challenges/:id', protect, requireRole('ADMIN'), ctrl.deleteChallenge);

// ── STAGE 3: Everyone can view ──
router.get('/challenges/my-participations', protect, requireRole('EMPLOYEE'), ctrl.myParticipations);
router.get('/challenges', protect, ctrl.listChallenges);          // service filters by role
router.get('/challenges/:id', protect, ctrl.getChallengeById);

// ── STAGE 4-5: Employee actions on their own participation ──
router.post('/challenges/:id/join', protect, requireRole('EMPLOYEE'), ctrl.joinChallenge);
router.post('/challenges/:id/submit-proof', protect, requireRole('EMPLOYEE'), ctrl.submitProof);

// ── STAGE 7: Manager (own dept) or Admin approval ──
router.get('/participations', protect, requireRole('ADMIN', 'MANAGER'), ctrl.listParticipations); // service scopes by dept for MANAGER
router.post('/participations/:id/approve', protect, requireOwnDepartmentOrAdmin, ctrl.approveParticipation);
router.post('/participations/:id/reject', protect, requireOwnDepartmentOrAdmin, ctrl.rejectParticipation);

// ── Leaderboard: everyone ──
router.get('/leaderboard/:type', protect, ctrl.getLeaderboard);

// ── Badges: Admin CRUD, Everyone read ──
router.post('/badges', protect, requireRole('ADMIN'), ctrl.createBadge);
router.get('/badges', protect, ctrl.getBadges);
router.put('/badges/:id', protect, requireRole('ADMIN'), ctrl.updateBadge);
router.delete('/badges/:id', protect, requireRole('ADMIN'), ctrl.deleteBadge);

// ── Rewards: Admin CRUD, Everyone read, Employee redeem ──
router.post('/rewards', protect, requireRole('ADMIN'), ctrl.createReward);
router.get('/rewards', protect, ctrl.getRewards);
router.put('/rewards/:id', protect, requireRole('ADMIN'), ctrl.updateReward);
router.delete('/rewards/:id', protect, requireRole('ADMIN'), ctrl.deleteReward);
router.post('/rewards/:id/redeem', protect, requireRole('EMPLOYEE'), ctrl.redeemReward);

module.exports = router;
