const { body } = require('express-validator');

const validateCreateTraining = [
  body('title').notEmpty().withMessage('Title is required').isString().trim(),
  body('description').optional().isString().trim(),
  body('department').notEmpty().withMessage('Department is required').isMongoId().withMessage('Invalid department ID'),
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
];

const validateUpdateTraining = [
  body('title').optional().isString().trim(),
  body('description').optional().isString().trim(),
  body('department').optional().isMongoId().withMessage('Invalid department ID'),
  body('startDate').optional().isISO8601().withMessage('Invalid start date'),
  body('endDate')
    .optional()
    .isISO8601().withMessage('Invalid end date')
    .custom((endDate, { req }) => {
      const start = req.body.startDate || req.query.startDate; // simple check
      if (start && new Date(endDate) <= new Date(start)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
];

const validateAssignTraining = [
  body('employeeIds').isArray({ min: 1 }).withMessage('employeeIds must be a non-empty array'),
  body('employeeIds.*').isMongoId().withMessage('Each employee ID must be a valid MongoID'),
];

module.exports = {
  validateCreateTraining,
  validateUpdateTraining,
  validateAssignTraining,
};
