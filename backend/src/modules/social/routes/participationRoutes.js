const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/participationController');
const { verifyToken, requireRole } = require('../../../middleware/auth');
const validate = require('../../../middleware/validate');
const { validateJoin, validateUploadProof, validateApproveReject } = require('../validations/participationValidation');

// Employee: join activity, view own, upload proof
router.post('/join', verifyToken, validateJoin, validate, ctrl.joinActivity);
router.post('/upload-proof', verifyToken, validateUploadProof, validate, ctrl.uploadProof);
router.get('/my', verifyToken, ctrl.getMyParticipations);

// Admin/Manager: view pending, approve, reject, view by activity
router.get('/pending', verifyToken, requireRole('ADMIN', 'MANAGER'), ctrl.getPendingParticipations);
router.get('/activity/:activityId', verifyToken, requireRole('ADMIN', 'MANAGER'), ctrl.getActivityParticipants);
router.patch('/:id/approve', verifyToken, requireRole('ADMIN', 'MANAGER'), validateApproveReject, validate, ctrl.approveParticipation);
router.patch('/:id/reject', verifyToken, requireRole('ADMIN', 'MANAGER'), validateApproveReject, validate, ctrl.rejectParticipation);

module.exports = router;
