const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../../middleware/auth');
const ctrl = require('./core.controller');

router.get('/dashboard', protect, ctrl.getDashboard);
router.get('/scores', protect, ctrl.getScores);
router.post('/scores/recalculate', protect, requireRole('ADMIN'), ctrl.recalculateScores);

router.get('/departments', protect, ctrl.getDepartments);
router.post('/departments', protect, requireRole('ADMIN'), ctrl.createDepartment);

router.get('/categories', protect, ctrl.getCategories);
router.post('/categories', protect, requireRole('ADMIN'), ctrl.createCategory);

router.get('/reports', protect, requireRole('ADMIN', 'MANAGER'), ctrl.getReport);
router.get('/leaderboard', protect, ctrl.getLeaderboard);

module.exports = router;
