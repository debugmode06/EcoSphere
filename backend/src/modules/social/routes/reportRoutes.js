const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reportController');
const { verifyToken, requireRole } = require('../../../middleware/auth');

// All report routes require token verification
router.use(verifyToken);

// Diversity metrics (visible to all authenticated roles)
router.get('/diversity', ctrl.getDiversityMetrics);

// Social reports & exports (visible to Admin and Manager only)
router.get('/social', requireRole('ADMIN', 'MANAGER'), ctrl.getSocialReport);
router.get('/social/export', requireRole('ADMIN', 'MANAGER'), ctrl.exportSocialReport);

module.exports = router;
