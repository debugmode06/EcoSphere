import client from './axiosClient';

export const getPolicies = () => client.get('/governance/policies');
export const createPolicy = (data) => client.post('/governance/policies', data);
export const acknowledgePolicy = (id) => client.post(`/governance/policies/${id}/acknowledge`);
export const getPolicyAcknowledgements = (id) => client.get(`/governance/policies/${id}/acknowledgements`);
export const getAudits = () => client.get('/governance/audits');
export const createAudit = (data) => client.post('/governance/audits', data);
export const getComplianceIssues = (params) => client.get('/governance/compliance-issues', { params });
export const createComplianceIssue = (data) => client.post('/governance/compliance-issues', data);
export const resolveIssue = (id) => client.patch(`/governance/compliance-issues/${id}/resolve`);
