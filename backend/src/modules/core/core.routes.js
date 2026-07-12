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
const Department = require('./models/Department.model');
const asyncHandler = require('../../utils/asyncHandler');
const { verifyToken } = require('../../middleware/auth');

// GET /api/core/departments — returns all departments (used by social module CSR form)
router.get('/departments', verifyToken, asyncHandler(async (req, res) => {
  const departments = await Department.find({ status: 'Active' }).sort({ name: 1 });
  res.json({ departments });
}));

// TODO (Person 4): Mount remaining core routes
// GET  /dashboard
// GET  /scores
// POST /scores/recalculate   (ADMIN)
// POST /departments           (ADMIN)
// GET  /categories
// POST /categories            (ADMIN)
// GET  /reports               (ADMIN, MANAGER)
// GET  /leaderboard

module.exports = router;
