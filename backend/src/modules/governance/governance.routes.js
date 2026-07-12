/**
 * Governance Routes
 * All routes require authentication (verifyToken).
 * ADMIN/MANAGER-only actions are gated with requireRole().
 */

const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const ctrl = require('./governance.controller');
const v = require('./governance.validation');

// ─── DASHBOARD ─────────────────────────────────────────────────────────────────
// GET /api/governance/dashboard
router.get('/dashboard', verifyToken, ctrl.getDashboard);

// ─── POLICIES ─────────────────────────────────────────────────────────────────

// GET  /api/governance/policies
router.get('/policies', verifyToken, ctrl.listPolicies);

// GET  /api/governance/policies/:id
router.get('/policies/:id', verifyToken, ctrl.getPolicy);

// POST /api/governance/policies              (ADMIN only)
router.post(
  '/policies',
  verifyToken,
  requireRole('ADMIN'),
  v.validateCreatePolicy,
  validate,
  ctrl.createPolicy
);

// PATCH /api/governance/policies/:id         (ADMIN only)
router.patch(
  '/policies/:id',
  verifyToken,
  requireRole('ADMIN'),
  v.validateUpdatePolicy,
  validate,
  ctrl.updatePolicy
);

// POST /api/governance/policies/:id/version  (ADMIN only)
router.post(
  '/policies/:id/version',
  verifyToken,
  requireRole('ADMIN'),
  ctrl.createPolicyVersion
);

// PATCH /api/governance/policies/:id/status  (ADMIN only)
router.patch(
  '/policies/:id/status',
  verifyToken,
  requireRole('ADMIN'),
  v.validateUpdatePolicyStatus,
  validate,
  ctrl.updatePolicyStatus
);

// POST /api/governance/policies/:id/acknowledge  (MANAGER, EMPLOYEE)
router.post(
  '/policies/:id/acknowledge',
  verifyToken,
  requireRole('MANAGER', 'EMPLOYEE'),
  ctrl.acknowledgePolicy
);

// GET  /api/governance/policies/:id/acknowledgements  (ADMIN, MANAGER)
router.get(
  '/policies/:id/acknowledgements',
  verifyToken,
  requireRole('ADMIN', 'MANAGER'),
  ctrl.listPolicyAcknowledgements
);

// GET  /api/governance/policies/:id/my-acknowledgement (any user — check own ack)
router.get('/policies/:id/my-acknowledgement', verifyToken, ctrl.checkAcknowledgement);

// GET  /api/governance/policies/:id/stats (ADMIN, MANAGER)
router.get(
  '/policies/:id/stats',
  verifyToken,
  requireRole('ADMIN', 'MANAGER'),
  ctrl.getPolicyStats
);

// POST /api/governance/policies/:id/reminder (ADMIN, MANAGER)
router.post(
  '/policies/:id/reminder',
  verifyToken,
  requireRole('ADMIN', 'MANAGER'),
  ctrl.sendPolicyReminder
);

// ─── AUDITS ───────────────────────────────────────────────────────────────────

// GET  /api/governance/audits
router.get('/audits', verifyToken, ctrl.listAudits);

// GET  /api/governance/audits/:id
router.get('/audits/:id', verifyToken, ctrl.getAudit);

// POST /api/governance/audits                (ADMIN, MANAGER)
router.post(
  '/audits',
  verifyToken,
  requireRole('ADMIN', 'MANAGER'),
  v.validateCreateAudit,
  validate,
  ctrl.createAudit
);

// PATCH /api/governance/audits/:id           (ADMIN, MANAGER)
router.patch(
  '/audits/:id',
  verifyToken,
  requireRole('ADMIN', 'MANAGER'),
  v.validateUpdateAudit,
  validate,
  ctrl.updateAudit
);

// ─── COMPLIANCE ISSUES ────────────────────────────────────────────────────────

// GET  /api/governance/compliance-issues
router.get(
  '/compliance-issues',
  verifyToken,
  v.validateComplianceQuery,
  validate,
  ctrl.listComplianceIssues
);

// GET  /api/governance/compliance-issues/:id
router.get('/compliance-issues/:id', verifyToken, ctrl.getComplianceIssue);

// POST /api/governance/compliance-issues     (ADMIN, MANAGER)
router.post(
  '/compliance-issues',
  verifyToken,
  requireRole('ADMIN', 'MANAGER'),
  v.validateCreateComplianceIssue,
  validate,
  ctrl.createComplianceIssue
);

// PATCH /api/governance/compliance-issues/:id/resolve  (ADMIN, MANAGER)
router.patch(
  '/compliance-issues/:id/resolve',
  verifyToken,
  requireRole('ADMIN', 'MANAGER'),
  v.validateResolveIssue,
  validate,
  ctrl.resolveComplianceIssue
);

// PATCH /api/governance/compliance-issues/:id          (ADMIN, MANAGER)
router.patch(
  '/compliance-issues/:id',
  verifyToken,
  requireRole('ADMIN', 'MANAGER'),
  v.validateUpdateComplianceIssue,
  validate,
  ctrl.updateComplianceIssue
);

module.exports = router;
