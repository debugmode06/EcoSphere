const { body } = require('express-validator');

const validateCreateActivity = [
  body('title').notEmpty().withMessage('Title is required').isString().trim(),
  body('description').optional().isString().trim(),
  body('categoryId').notEmpty().withMessage('Category is required').isMongoId().withMessage('Invalid category ID'),
  body('departmentId').notEmpty().withMessage('Department is required').isMongoId().withMessage('Invalid department ID'),
  body('location').notEmpty().withMessage('Location is required').isString().trim(),
  body('startDate').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Invalid start date'),
  body('endDate')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('Invalid end date')
    .custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('maxParticipants').notEmpty().withMessage('Max participants is required').isInt({ min: 1 }).withMessage('Must be at least 1'),
  body('evidenceRequired').optional().isBoolean().withMessage('Must be true or false'),
  body('status').optional().isIn(['draft', 'active', 'closed']).withMessage('Invalid status'),
];

const validateUpdateActivity = [
  body('title').optional().isString().trim(),
  body('description').optional().isString().trim(),
  body('categoryId').optional().isMongoId().withMessage('Invalid category ID'),
  body('departmentId').optional().isMongoId().withMessage('Invalid department ID'),
  body('location').optional().isString().trim(),
  body('startDate').optional().isISO8601().withMessage('Invalid start date'),
  body('endDate').optional().isISO8601().withMessage('Invalid end date'),
  body('maxParticipants').optional().isInt({ min: 1 }).withMessage('Must be at least 1'),
  body('evidenceRequired').optional().isBoolean(),
  body('status').optional().isIn(['draft', 'active', 'closed']).withMessage('Invalid status'),
];

module.exports = { validateCreateActivity, validateUpdateActivity };
