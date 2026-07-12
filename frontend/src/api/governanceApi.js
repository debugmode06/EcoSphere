import client from './axiosClient';

// ─── Policies ─────────────────────────────────────────────────────────────────
export const getPolicies = () => client.get('/governance/policies');
export const getPolicy = (id) => client.get(`/governance/policies/${id}`);
export const createPolicy = (data) => client.post('/governance/policies', data);
export const updatePolicy = (id, data) => client.patch(`/governance/policies/${id}`, data);
export const createPolicyVersion = (id) => client.post(`/governance/policies/${id}/version`);
export const updatePolicyStatus = (id, status) =>
  client.patch(`/governance/policies/${id}/status`, { status });
export const acknowledgePolicy = (id, data) =>
  client.post(`/governance/policies/${id}/acknowledge`, data);
export const getPolicyAcknowledgements = (id) =>
  client.get(`/governance/policies/${id}/acknowledgements`);
export const checkMyAcknowledgement = (id) =>
  client.get(`/governance/policies/${id}/my-acknowledgement`);
export const getPolicyStats = (id) =>
  client.get(`/governance/policies/${id}/stats`);
export const sendPolicyReminder = (id) =>
  client.post(`/governance/policies/${id}/reminder`);

// ─── Audits ───────────────────────────────────────────────────────────────────
export const getAudits = (params) => client.get('/governance/audits', { params });
export const getAudit = (id) => client.get(`/governance/audits/${id}`);
export const createAudit = (data) => client.post('/governance/audits', data);
export const updateAudit = (id, data) => client.patch(`/governance/audits/${id}`, data);

// ─── Compliance Issues ────────────────────────────────────────────────────────
export const getComplianceIssues = (params) =>
  client.get('/governance/compliance-issues', { params });
export const getComplianceIssue = (id) => client.get(`/governance/compliance-issues/${id}`);
export const createComplianceIssue = (data) =>
  client.post('/governance/compliance-issues', data);
export const resolveIssue = (id, data) =>
  client.patch(`/governance/compliance-issues/${id}/resolve`, data);
export const updateComplianceIssue = (id, data) =>
  client.patch(`/governance/compliance-issues/${id}`, data);

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const getGovernanceDashboard = () => client.get('/governance/dashboard');
