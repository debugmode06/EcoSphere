const { body } = require('express-validator');

const validateJoin = [
  body('csrActivityId')
    .notEmpty().withMessage('Activity ID is required')
    .isMongoId().withMessage('Invalid activity ID'),
];

const validateUploadProof = [
  body('participationId')
    .notEmpty().withMessage('Participation ID is required')
    .isMongoId().withMessage('Invalid participation ID'),
  body('proofDocument')
    .notEmpty().withMessage('Proof document URL is required')
    .isURL().withMessage('Proof document must be a valid URL'),
];

const validateApproveReject = [
  body('remarks').optional().isString().trim(),
];

module.exports = { validateJoin, validateUploadProof, validateApproveReject };
