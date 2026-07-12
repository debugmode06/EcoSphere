/**
 * Governance Service
 * All business logic for policies, audits, and compliance issues.
 */

const EsgPolicy = require('./models/EsgPolicy.model');
const PolicyAcknowledgement = require('./models/PolicyAcknowledgement.model');
const Audit = require('./models/Audit.model');
const ComplianceIssue = require('./models/ComplianceIssue.model');
const Employee = require('../auth/models/Employee.model');
const Department = require('../core/models/Department.model');
const { notifyOverdueCompliance } = require('../core/notificationService');

// ─── POLICIES ────────────────────────────────────────────────────────────────

/**
 * List policies based on role
 */
const getPolicies = async (userRole) => {
  const filter = {};
  if (userRole === 'EMPLOYEE') {
    filter.status = 'Published';
  } else if (userRole === 'MANAGER') {
    filter.status = { $in: ['Published', 'Archived'] };
  }
  return EsgPolicy.find(filter).sort({ createdAt: -1 });
};

/**
 * Get a single policy by ID
 */
const getPolicyById = async (id, userRole) => {
  const policy = await EsgPolicy.findById(id);
  if (!policy) throw Object.assign(new Error('Policy not found'), { statusCode: 404 });
  
  if (userRole === 'EMPLOYEE' && policy.status !== 'Published') {
    throw Object.assign(new Error('Access denied'), { statusCode: 403 });
  }
  if (userRole === 'MANAGER' && policy.status === 'Draft') {
    throw Object.assign(new Error('Access denied'), { statusCode: 403 });
  }
  return policy;
};

/**
 * Create a new policy (defaults to Draft)
 */
const createPolicy = async (data) => {
  const policy = await EsgPolicy.create(data);
  return policy;
};

/**
 * Update policy status: Draft → Published → Archived
 * Sets publishedDate automatically when status = Published
 */
const updatePolicyStatus = async (id, status) => {
  const allowed = ['Draft', 'Published', 'Archived'];
  if (!allowed.includes(status)) {
    throw Object.assign(new Error(`Invalid status. Must be one of: ${allowed.join(', ')}`), { statusCode: 400 });
  }

  const policy = await EsgPolicy.findById(id);
  if (!policy) throw Object.assign(new Error('Policy not found'), { statusCode: 404 });

  policy.status = status;
  await policy.save(); // pre-save hook sets publishedDate

  if (status === 'Published') {
    console.log(`[NOTIFICATION] Policy "${policy.title}" has been published. Notifying all employees...`);
  }

  return policy;
};

const updatePolicy = async (id, data) => {
  const policy = await EsgPolicy.findById(id);
  if (!policy) throw Object.assign(new Error('Policy not found'), { statusCode: 404 });
  if (policy.status !== 'Draft') {
    throw Object.assign(new Error('Only Draft policies can be edited'), { statusCode: 400 });
  }

  const updatedPolicy = await EsgPolicy.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  return updatedPolicy;
};

const createPolicyVersion = async (id) => {
  const existingPolicy = await EsgPolicy.findById(id);
  if (!existingPolicy) throw Object.assign(new Error('Policy not found'), { statusCode: 404 });
  if (existingPolicy.status === 'Draft') {
    throw Object.assign(new Error('Cannot create a new version from a Draft policy'), { statusCode: 400 });
  }

  // Increment version logic (e.g. "1.0" -> "2.0")
  let newVersion = '1.0';
  if (existingPolicy.version) {
    const parts = existingPolicy.version.split('.');
    if (parts.length > 0 && !isNaN(parts[0])) {
      newVersion = `${parseInt(parts[0], 10) + 1}.0`;
    }
  }

  const newPolicyData = {
    title: existingPolicy.title,
    description: existingPolicy.description,
    esgCategory: existingPolicy.esgCategory,
    effectiveDate: existingPolicy.effectiveDate,
    expiryDate: existingPolicy.expiryDate,
    priority: existingPolicy.priority,
    pdfUrl: existingPolicy.pdfUrl,
    version: newVersion,
    status: 'Draft',
    createdBy: existingPolicy.createdBy,
  };

  const newPolicy = await EsgPolicy.create(newPolicyData);
  return newPolicy;
};

const acknowledgePolicy = async (policyId, employeeId, feedback = '') => {
  const policy = await EsgPolicy.findById(policyId);
  if (!policy) throw Object.assign(new Error('Policy not found'), { statusCode: 404 });
  if (policy.status !== 'Published') {
    throw Object.assign(new Error('Only Published policies can be acknowledged'), { statusCode: 400 });
  }

  const ack = await PolicyAcknowledgement.create({
    policy: policyId,
    employee: employeeId,
    acknowledgedDate: new Date(),
    feedback: feedback || '',
  });
  return ack;
};

/**
 * Get all acknowledgements for a specific policy (with employee details)
 */
const getPolicyAcknowledgements = async (policyId) => {
  return PolicyAcknowledgement.find({ policy: policyId })
    .populate('employee', 'name email role')
    .sort({ acknowledgedDate: -1 });
};

/**
 * Check if a specific employee has acknowledged a policy
 */
const hasEmployeeAcknowledged = async (policyId, employeeId) => {
  const ack = await PolicyAcknowledgement.findOne({ policy: policyId, employee: employeeId });
  return !!ack;
};

// ─── AUDITS ───────────────────────────────────────────────────────────────────

/**
 * List all audits with optional status filter, dept populated
 */
const getAudits = async (query = {}) => {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.department) filter.department = query.department;

  return Audit.find(filter)
    .populate('department', 'name code')
    .sort({ date: -1 });
};

/**
 * Get a single audit by ID
 */
const getAuditById = async (id) => {
  const audit = await Audit.findById(id).populate('department', 'name code');
  if (!audit) throw Object.assign(new Error('Audit not found'), { statusCode: 404 });
  return audit;
};

/**
 * Create a new audit
 */
const createAudit = async (data) => {
  const audit = await Audit.create(data);
  await audit.populate('department', 'name code');
  return audit;
};

/**
 * Update audit (status, findings, date, title)
 */
const updateAudit = async (id, data) => {
  const audit = await Audit.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate('department', 'name code');
  if (!audit) throw Object.assign(new Error('Audit not found'), { statusCode: 404 });
  return audit;
};

// ─── COMPLIANCE ISSUES ────────────────────────────────────────────────────────

/**
 * List compliance issues with optional filters.
 * Auto-detects overdue status on read so the UI always gets fresh data.
 */
const getComplianceIssues = async (query = {}) => {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.severity) filter.severity = query.severity;
  if (query.isOverdue === 'true') filter.isOverdue = true;

  const issues = await ComplianceIssue.find(filter)
    .populate('audit', 'title')
    .sort({ createdAt: -1 });

  // Re-evaluate overdue on read for issues that haven't been saved recently
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const updates = [];
  for (const issue of issues) {
    const shouldBeOverdue = issue.status === 'OPEN' && issue.dueDate < today;
    if (shouldBeOverdue !== issue.isOverdue) {
      issue.isOverdue = shouldBeOverdue;
      updates.push(
        ComplianceIssue.findByIdAndUpdate(issue._id, { isOverdue: shouldBeOverdue })
      );
      // Notify if just became overdue
      if (shouldBeOverdue && !issue.isOverdue) {
        notifyOverdueCompliance(issue);
      }
    }
  }
  if (updates.length > 0) await Promise.all(updates);

  return issues;
};

/**
 * Get a single compliance issue by ID
 */
const getComplianceIssueById = async (id) => {
  const issue = await ComplianceIssue.findById(id).populate('audit', 'title');
  if (!issue) throw Object.assign(new Error('Compliance issue not found'), { statusCode: 404 });
  return issue;
};

/**
 * Create a compliance issue (owner + dueDate enforced at model level)
 */
const createComplianceIssue = async (data) => {
  const issue = await ComplianceIssue.create(data);
  return issue;
};

/**
 * Resolve a compliance issue → status = RESOLVED, set resolvedDate
 */
const resolveIssue = async (id, resolutionNotes) => {
  const issue = await ComplianceIssue.findById(id);
  if (!issue) throw Object.assign(new Error('Compliance issue not found'), { statusCode: 404 });
  if (issue.status === 'RESOLVED') {
    throw Object.assign(new Error('Issue is already resolved'), { statusCode: 400 });
  }

  issue.status = 'RESOLVED';
  issue.isOverdue = false;
  issue.resolvedDate = new Date();
  if (resolutionNotes) issue.resolutionNotes = resolutionNotes;

  await issue.save();
  return issue;
};

/**
 * Update a compliance issue (ADMIN/MANAGER only — enforced at route level)
 */
const updateComplianceIssue = async (id, data) => {
  const issue = await ComplianceIssue.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!issue) throw Object.assign(new Error('Compliance issue not found'), { statusCode: 404 });
  return issue;
};

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────

/**
 * Aggregate key governance stats for a lightweight dashboard widget
 */
const getDashboardStats = async () => {
  const [
    totalPolicies,
    publishedPolicies,
    totalAudits,
    completedAudits,
    openIssues,
    overdueIssues,
    resolvedIssues,
  ] = await Promise.all([
    EsgPolicy.countDocuments(),
    EsgPolicy.countDocuments({ status: 'Published' }),
    Audit.countDocuments(),
    Audit.countDocuments({ status: 'Completed' }),
    ComplianceIssue.countDocuments({ status: 'OPEN' }),
    ComplianceIssue.countDocuments({ status: 'OPEN', isOverdue: true }),
    ComplianceIssue.countDocuments({ status: 'RESOLVED' }),
  ]);

  const auditCompletionRate =
    totalAudits > 0 ? Math.round((completedAudits / totalAudits) * 100) : 0;

  return {
    totalPolicies,
    publishedPolicies,
    totalAudits,
    completedAudits,
    auditCompletionRate,
    openIssues,
    overdueIssues,
    resolvedIssues,
  };
};

const getPolicyStats = async (policyId) => {
  const policy = await EsgPolicy.findById(policyId);
  if (!policy) throw Object.assign(new Error('Policy not found'), { statusCode: 404 });

  // Find all acknowledgements and populate employee details
  const acks = await PolicyAcknowledgement.find({ policy: policyId })
    .populate('employee', 'name email role department');

  // Total counts of managers and employees in the system
  const [totalManagers, totalEmployees] = await Promise.all([
    Employee.countDocuments({ role: 'MANAGER' }),
    Employee.countDocuments({ role: 'EMPLOYEE' }),
  ]);

  // Acknowledged counts by role
  const managerAcks = acks.filter((a) => a.employee && a.employee.role === 'MANAGER').length;
  const employeeAcks = acks.filter((a) => a.employee && a.employee.role === 'EMPLOYEE').length;

  const totalUsersCount = totalManagers + totalEmployees;
  const acknowledgedCount = managerAcks + employeeAcks;
  const pendingCount = Math.max(0, totalUsersCount - acknowledgedCount);

  // Filter acknowledgements that contain feedback
  const feedbackList = acks
    .filter((a) => a.feedback && a.feedback.trim() !== '')
    .map((a) => ({
      employeeName: a.employee?.name || 'Unknown User',
      employeeEmail: a.employee?.email || 'N/A',
      employeeRole: a.employee?.role || 'EMPLOYEE',
      feedback: a.feedback,
      acknowledgedDate: a.acknowledgedDate,
    }));

  // Calculate Department Progress
  const departments = await Department.find();
  const departmentProgress = [];

  for (const dept of departments) {
    const totalInDept = await Employee.countDocuments({ department: dept._id });
    const deptAcks = acks.filter(
      (a) => a.employee && a.employee.department && a.employee.department.toString() === dept._id.toString()
    ).length;

    departmentProgress.push({
      name: dept.name,
      code: dept.code,
      progress: totalInDept > 0 ? Math.round((deptAcks / totalInDept) * 100) : 100,
      acknowledged: deptAcks,
      total: totalInDept,
    });
  }

  // Calculate Pending Users
  const allUsers = await Employee.find({ role: { $in: ['MANAGER', 'EMPLOYEE'] } })
    .select('name email role')
    .populate('department', 'name');
  const ackedIds = acks.map((a) => a.employee && a.employee._id ? a.employee._id.toString() : '');
  const pendingUsersList = allUsers
    .filter((u) => !ackedIds.includes(u._id.toString()))
    .map((u) => ({
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department?.name || 'N/A'
    }));

  return {
    policy: {
      _id: policy._id,
      title: policy.title,
      version: policy.version,
      publishedDate: policy.publishedDate,
      priority: policy.priority || 'Medium',
      esgCategory: policy.esgCategory || 'Governance',
      pdfUrl: policy.pdfUrl || '',
    },
    stats: {
      managers: {
        acknowledged: managerAcks,
        total: totalManagers,
      },
      employees: {
        acknowledged: employeeAcks,
        total: totalEmployees,
      },
      pending: pendingCount,
      feedbackCount: feedbackList.length,
      feedbacks: feedbackList,
      pendingUsers: pendingUsersList,
    },
    departmentProgress,
  };
};

const sendPolicyReminder = async (policyId) => {
  const policy = await EsgPolicy.findById(policyId);
  if (!policy) throw Object.assign(new Error('Policy not found'), { statusCode: 404 });

  // Get all users (except admins, who don't necessarily have to acknowledge policies)
  const allUsers = await Employee.find({ role: { $in: ['MANAGER', 'EMPLOYEE'] } }).select('email name');
  const acks = await PolicyAcknowledgement.find({ policy: policyId }).select('employee');
  const ackedIds = acks.map((a) => a.employee.toString());

  const pendingUsers = allUsers.filter((u) => !ackedIds.includes(u._id.toString()));

  // In production, wire this to email sending/notification logs.
  console.log(`[REMINDER] Sending policy acknowledgement reminders for "${policy.title}" to ${pendingUsers.length} users.`);
  
  return {
    success: true,
    remindersSent: pendingUsers.length,
    users: pendingUsers.map((u) => ({ name: u.name, email: u.email })),
  };
};

module.exports = {
  // Policies
  getPolicies,
  getPolicyById,
  createPolicy,
  updatePolicy,
  createPolicyVersion,
  updatePolicyStatus,
  acknowledgePolicy,
  getPolicyAcknowledgements,
  hasEmployeeAcknowledged,
  getPolicyStats,
  sendPolicyReminder,
  // Audits
  getAudits,
  getAuditById,
  createAudit,
  updateAudit,
  // Compliance
  getComplianceIssues,
  getComplianceIssueById,
  createComplianceIssue,
  resolveIssue,
  updateComplianceIssue,
  // Dashboard
  getDashboardStats,
};
