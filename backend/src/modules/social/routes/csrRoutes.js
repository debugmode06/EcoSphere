const express = require('express');
const router = express.Router();
const csrController = require('../controllers/csrController');
const { verifyToken, requireRole } = require('../../../middleware/auth');
const validate = require('../../../middleware/validate');
const { validateCreateActivity, validateUpdateActivity } = require('../validations/csrValidation');

// All authenticated users can view activities
router.get('/', verifyToken, csrController.getActivities);
router.get('/:id', verifyToken, csrController.getActivityById);

// Admin/Manager operations
router.post('/', verifyToken, requireRole('ADMIN', 'MANAGER'), validateCreateActivity, validate, csrController.createActivity);
router.put('/:id', verifyToken, requireRole('ADMIN', 'MANAGER'), validateUpdateActivity, validate, csrController.updateActivity);
router.delete('/:id', verifyToken, requireRole('ADMIN', 'MANAGER'), csrController.deleteActivity);
router.patch('/:id/publish', verifyToken, requireRole('ADMIN', 'MANAGER'), csrController.publishActivity);
router.patch('/:id/close', verifyToken, requireRole('ADMIN', 'MANAGER'), csrController.closeActivity);

module.exports = router;
