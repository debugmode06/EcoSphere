const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/trainingController');
const { verifyToken, requireRole } = require('../../../middleware/auth');
const validate = require('../../../middleware/validate');
const {
  validateCreateTraining,
  validateUpdateTraining,
  validateAssignTraining,
} = require('../validations/trainingValidation');

// All training routes require authentication
router.use(verifyToken);

// Employee: View assigned trainings/history and mark as complete
router.get('/my-history', ctrl.getEmployeeTrainingHistory);
router.patch('/:id/complete', ctrl.markComplete);

// Admin/Manager & Employee: Get all trainings
router.get('/', ctrl.getTrainings);

// Admin/Manager operations: Create, update, delete, assign
router.post('/', requireRole('ADMIN', 'MANAGER'), validateCreateTraining, validate, ctrl.createTraining);
router.put('/:id', requireRole('ADMIN', 'MANAGER'), validateUpdateTraining, validate, ctrl.updateTraining);
router.delete('/:id', requireRole('ADMIN', 'MANAGER'), ctrl.deleteTraining);
router.post('/:id/assign', requireRole('ADMIN', 'MANAGER'), validateAssignTraining, validate, ctrl.assignTraining);

module.exports = router;
