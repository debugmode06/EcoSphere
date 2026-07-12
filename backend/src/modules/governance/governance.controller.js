/**
 * Governance Controller
 * Thin layer: validates request, delegates to service, sends response.
 */

const asyncHandler = require('../../utils/asyncHandler');
const service = require('./governance.service');

// ─── POLICIES ────────────────────────────────────────────────────────────────

const listPolicies = asyncHandler(async (req, res) => {
  const policies = await service.getPolicies(req.user.role);
  res.json({ policies });
});

const getPolicy = asyncHandler(async (req, res) => {
  const policy = await service.getPolicyById(req.params.id, req.user.role);
  res.json({ policy });
});

const createPolicy = asyncHandler(async (req, res) => {
  const policy = await service.createPolicy({
    ...req.body,
    createdBy: req.user._id,
  });
  res.status(201).json({ policy, message: 'Policy created successfully' });
});

const updatePolicy = asyncHandler(async (req, res) => {
  const policy = await service.updatePolicy(req.params.id, req.body);
  res.json({ policy, message: 'Policy updated successfully' });
});

const createPolicyVersion = asyncHandler(async (req, res) => {
  const policy = await service.createPolicyVersion(req.params.id);
  res.status(201).json({ policy, message: 'New policy version created as Draft' });
});

const updatePolicyStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ message: 'status is required' });
  }
  const policy = await service.updatePolicyStatus(req.params.id, status);
  res.json({ policy, message: `Policy status updated to ${status}` });
});

const acknowledgePolicy = asyncHandler(async (req, res) => {
  const { feedback } = req.body;
  const ack = await service.acknowledgePolicy(req.params.id, req.user._id, feedback);
  res.status(201).json({ acknowledgement: ack, message: 'Policy acknowledged successfully' });
});

const listPolicyAcknowledgements = asyncHandler(async (req, res) => {
  const acknowledgements = await service.getPolicyAcknowledgements(req.params.id);
  res.json({ acknowledgements });
});

const checkAcknowledgement = asyncHandler(async (req, res) => {
  const acknowledged = await service.hasEmployeeAcknowledged(req.params.id, req.user._id);
  res.json({ acknowledged });
});

// ─── AUDITS ───────────────────────────────────────────────────────────────────

const listAudits = asyncHandler(async (req, res) => {
  const audits = await service.getAudits(req.query);
  res.json({ audits });
});

const getAudit = asyncHandler(async (req, res) => {
  const audit = await service.getAuditById(req.params.id);
  res.json({ audit });
});

const createAudit = asyncHandler(async (req, res) => {
  const audit = await service.createAudit({
    ...req.body,
    createdBy: req.user._id,
  });
  res.status(201).json({ audit, message: 'Audit created successfully' });
});

const updateAudit = asyncHandler(async (req, res) => {
  const audit = await service.updateAudit(req.params.id, req.body);
  res.json({ audit, message: 'Audit updated successfully' });
});

// ─── COMPLIANCE ISSUES ────────────────────────────────────────────────────────

const listComplianceIssues = asyncHandler(async (req, res) => {
  const issues = await service.getComplianceIssues(req.query);
  res.json({ issues });
});

const getComplianceIssue = asyncHandler(async (req, res) => {
  const issue = await service.getComplianceIssueById(req.params.id);
  res.json({ issue });
});

const createComplianceIssue = asyncHandler(async (req, res) => {
  const issue = await service.createComplianceIssue(req.body);
  res.status(201).json({ issue, message: 'Compliance issue logged successfully' });
});

const resolveComplianceIssue = asyncHandler(async (req, res) => {
  const { resolutionNotes } = req.body;
  const issue = await service.resolveIssue(req.params.id, resolutionNotes);
  res.json({ issue, message: 'Compliance issue resolved' });
});

const updateComplianceIssue = asyncHandler(async (req, res) => {
  const issue = await service.updateComplianceIssue(req.params.id, req.body);
  res.json({ issue, message: 'Compliance issue updated' });
});

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

const getDashboard = asyncHandler(async (req, res) => {
  const stats = await service.getDashboardStats();
  res.json({ stats });
});

const getPolicyStats = asyncHandler(async (req, res) => {
  const stats = await service.getPolicyStats(req.params.id);
  res.json(stats);
});

const sendPolicyReminder = asyncHandler(async (req, res) => {
  const result = await service.sendPolicyReminder(req.params.id);
  res.json({ message: 'Reminders triggered successfully', ...result });
});

module.exports = {
  // Policies
  listPolicies,
  getPolicy,
  createPolicy,
  updatePolicy,
  createPolicyVersion,
  updatePolicyStatus,
  acknowledgePolicy,
  listPolicyAcknowledgements,
  checkAcknowledgement,
  getPolicyStats,
  sendPolicyReminder,
  // Audits
  listAudits,
  getAudit,
  createAudit,
  updateAudit,
  // Compliance
  listComplianceIssues,
  getComplianceIssue,
  createComplianceIssue,
  resolveComplianceIssue,
  updateComplianceIssue,
  // Dashboard
  getDashboard,
};
