const { body } = require('express-validator');

const challengeRules = [
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('xp').isNumeric().withMessage('XP must be a number').toInt(),
  body('difficulty').optional().isIn(['Easy', 'Medium', 'Hard']).withMessage('Difficulty must be Easy, Medium, or Hard'),
  body('evidenceRequired').optional().isBoolean().toBoolean(),
  body('deadline').optional().isISO8601().withMessage('Deadline must be a valid date'),
  body('status').optional().isIn(['DRAFT', 'ACTIVE', 'UNDER_REVIEW', 'COMPLETED', 'ARCHIVED']).withMessage('Invalid status')
];

const badgeRules = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('unlockType').isIn(['xp', 'challengeCount', 'csrCount', 'carbonSaved']).withMessage('Invalid unlock type'),
  body('threshold').isNumeric().withMessage('Threshold must be a number').toInt(),
  body('icon').optional().trim()
];

const rewardRules = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('pointsRequired').isNumeric().withMessage('Points required must be a number').toInt(),
  body('stock').isNumeric().withMessage('Stock must be a number').toInt(),
  body('status').optional().trim()
];

const submitProofRules = [
  body('proofUrl').notEmpty().withMessage('Proof URL is required').isURL().withMessage('Proof URL must be a valid URL')
];

module.exports = {
  challengeRules,
  badgeRules,
  rewardRules,
  submitProofRules
};
