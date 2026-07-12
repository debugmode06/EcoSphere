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

// ─── DASHBOARD & SCORING ───────────────────────────────────────────────────────
// GET /api/governance/dashboard
router.get('/dashboard', verifyToken, ctrl.getDashboard);

// GET /api/governance/score/org
router.get('/score/org', verifyToken, ctrl.getOrgScore);

// GET /api/governance/score/dept (leaderboard)
router.get('/score/dept', verifyToken, ctrl.getAllDeptScores);

// GET /api/governance/score/dept/:id
router.get('/score/dept/:id', verifyToken, ctrl.getDeptScore);

// GET /api/governance/export
router.get('/export', verifyToken, requireRole('ADMIN', 'MANAGER'), ctrl.exportGovernanceData);

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

// GET  /api/governance/audits                (ADMIN, MANAGER)
router.get('/audits', verifyToken, requireRole('ADMIN', 'MANAGER'), ctrl.listAudits);

// GET  /api/governance/audits/:id            (ADMIN, MANAGER)
router.get('/audits/:id', verifyToken, requireRole('ADMIN', 'MANAGER'), ctrl.getAudit);

// POST /api/governance/audits                (ADMIN only)
router.post(
  '/audits',
  verifyToken,
  requireRole('ADMIN'),
  v.validateCreateAudit,
  validate,
  ctrl.createAudit
);

// PATCH /api/governance/audits/:id           (ADMIN only)
router.patch(
  '/audits/:id',
  verifyToken,
  requireRole('ADMIN'),
  v.validateUpdateAudit,
  validate,
  ctrl.updateAudit
);

// ─── COMPLIANCE ISSUES ────────────────────────────────────────────────────────

// GET  /api/governance/compliance-issues     (ADMIN, MANAGER)
router.get(
  '/compliance-issues',
  verifyToken,
  requireRole('ADMIN', 'MANAGER'),
  v.validateComplianceQuery,
  validate,
  ctrl.listComplianceIssues
);

// GET  /api/governance/compliance-issues/:id (ADMIN, MANAGER)
router.get('/compliance-issues/:id', verifyToken, requireRole('ADMIN', 'MANAGER'), ctrl.getComplianceIssue);

// POST /api/governance/compliance-issues     (ADMIN only)
router.post(
  '/compliance-issues',
  verifyToken,
  requireRole('ADMIN'),
  v.validateCreateComplianceIssue,
  validate,
  ctrl.createComplianceIssue
);

// PATCH /api/governance/compliance-issues/:id/resolve  (MANAGER only)
router.patch(
  '/compliance-issues/:id/resolve',
  verifyToken,
  requireRole('MANAGER'),
  v.validateResolveIssue,
  validate,
  ctrl.resolveComplianceIssue
);

// POST /api/governance/compliance-issues/:id/review   (ADMIN only)
router.post(
  '/compliance-issues/:id/review',
  verifyToken,
  requireRole('ADMIN'),
  ctrl.reviewComplianceIssue
);

// PATCH /api/governance/compliance-issues/:id          (ADMIN only)
router.patch(
  '/compliance-issues/:id',
  verifyToken,
  requireRole('ADMIN'),
  v.validateUpdateComplianceIssue,
  validate,
  ctrl.updateComplianceIssue
);

module.exports = router;
