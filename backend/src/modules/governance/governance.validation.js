/**
 * Governance Validation Rules
 * Uses express-validator (already a project dependency).
 */

const { body, param, query } = require('express-validator');

// ─── POLICY VALIDATORS ────────────────────────────────────────────────────────

const validateCreatePolicy = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be 3–200 characters'),

  body('description')
    .optional()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),

  body('esgCategory')
    .trim()
    .notEmpty().withMessage('ESG Category is required'),

  body('effectiveDate')
    .notEmpty().withMessage('Effective date is required')
    .isISO8601().withMessage('Effective date must be a valid ISO date'),

  body('expiryDate')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('Expiry date must be a valid ISO date'),

  body('priority')
    .optional()
    .isIn(['High', 'Medium', 'Low']).withMessage('Priority must be High, Medium, or Low'),

  body('pdfUrl')
    .optional()
    .trim(),

  body('version')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Version cannot exceed 20 characters'),

  body('status')
    .optional()
    .isIn(['Draft', 'Published', 'Archived']).withMessage('Status must be Draft, Published, or Archived'),
];

const validateUpdatePolicyStatus = [
  param('id')
    .isMongoId().withMessage('Invalid policy ID'),

  body('status')
    .notEmpty().withMessage('status is required')
    .isIn(['Draft', 'Published', 'Archived']).withMessage('Status must be Draft, Published, or Archived'),
];

// ─── AUDIT VALIDATORS ─────────────────────────────────────────────────────────

const validateCreateAudit = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be 3–200 characters'),

  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Date must be a valid ISO date'),

  body('status')
    .optional()
    .isIn(['Scheduled', 'In Progress', 'Completed', 'Cancelled'])
    .withMessage('Invalid audit status'),

  body('findings')
    .optional()
    .isLength({ max: 5000 }).withMessage('Findings cannot exceed 5000 characters'),

  body('department')
    .optional()
    .isMongoId().withMessage('Invalid department ID'),
];

const validateUpdateAudit = [
  param('id')
    .isMongoId().withMessage('Invalid audit ID'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('Title must be 3–200 characters'),

  body('status')
    .optional()
    .isIn(['Scheduled', 'In Progress', 'Completed', 'Cancelled'])
    .withMessage('Invalid audit status'),

  body('findings')
    .optional()
    .isLength({ max: 5000 }).withMessage('Findings cannot exceed 5000 characters'),
];

// ─── COMPLIANCE VALIDATORS ────────────────────────────────────────────────────

const validateCreateComplianceIssue = [
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required — Business Rule')
    .isLength({ min: 5, max: 2000 }).withMessage('Description must be 5–2000 characters'),

  body('severity')
    .notEmpty().withMessage('Severity is required')
    .isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Severity must be Low, Medium, High, or Critical'),

  body('owner')
    .trim()
    .notEmpty().withMessage('Owner is required — Business Rule: every issue must have an owner'),

  body('dueDate')
    .notEmpty().withMessage('Due date is required — Business Rule: every issue must have a due date')
    .isISO8601().withMessage('Due date must be a valid ISO date'),

  body('audit')
    .optional({ nullable: true })
    .isMongoId().withMessage('Invalid audit ID'),
];

const validateResolveIssue = [
  param('id')
    .isMongoId().withMessage('Invalid compliance issue ID'),

  body('resolutionNotes')
    .optional()
    .isLength({ max: 2000 }).withMessage('Resolution notes cannot exceed 2000 characters'),
];

const validateUpdateComplianceIssue = [
  param('id')
    .isMongoId().withMessage('Invalid compliance issue ID'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 5, max: 2000 }).withMessage('Description must be 5–2000 characters'),

  body('severity')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid severity'),

  body('status')
    .optional()
    .isIn(['OPEN', 'RESOLVED']).withMessage('Status must be OPEN or RESOLVED'),
];

// ─── QUERY VALIDATORS ─────────────────────────────────────────────────────────

const validateComplianceQuery = [
  query('status')
    .optional()
    .isIn(['OPEN', 'RESOLVED']).withMessage('status filter must be OPEN or RESOLVED'),

  query('severity')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid severity filter'),

  query('isOverdue')
    .optional()
    .isIn(['true', 'false']).withMessage('isOverdue must be true or false'),
];

const validateAcknowledgePolicy = [
  param('id')
    .isMongoId().withMessage('Invalid policy ID'),
  body('feedback')
    .optional()
    .trim(),
];

const validateUpdatePolicy = [
  param('id')
    .isMongoId().withMessage('Invalid policy ID'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('Title must be 3–200 characters'),

  body('description')
    .optional()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),

  body('esgCategory')
    .optional()
    .trim(),

  body('effectiveDate')
    .optional()
    .isISO8601().withMessage('Effective date must be a valid ISO date'),

  body('expiryDate')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('Expiry date must be a valid ISO date'),

  body('priority')
    .optional()
    .isIn(['High', 'Medium', 'Low']).withMessage('Priority must be High, Medium, or Low'),

  body('pdfUrl')
    .optional()
    .trim(),

  body('version')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Version cannot exceed 20 characters'),
];

module.exports = {
  validateCreatePolicy,
  validateUpdatePolicy,
  validateUpdatePolicyStatus,
  validateAcknowledgePolicy,
  validateCreateAudit,
  validateUpdateAudit,
  validateCreateComplianceIssue,
  validateResolveIssue,
  validateUpdateComplianceIssue,
  validateComplianceQuery,
};
