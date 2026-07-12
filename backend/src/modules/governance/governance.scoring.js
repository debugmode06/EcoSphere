/**
 * Governance Scoring Engine
 *
 * Weights:
 *   Policy Score   30% — ratio of Published policies to total
 *   Audit Score    40% — ratio of Completed audits to total
 *   Compliance     30% — ratio of RESOLVED issues to total
 *
 * Each sub-score is 0-100. Final score is 0-100.
 * If no data exists for a category, that category defaults to 100 (nothing to fail on).
 */

const EsgPolicy = require('./models/EsgPolicy.model');
const Audit = require('./models/Audit.model');
const ComplianceIssue = require('./models/ComplianceIssue.model');
const Department = require('../core/models/Department.model');

const WEIGHTS = { policy: 0.30, audit: 0.40, compliance: 0.30 };

/** Clamp a value between 0 and 100 and round to 1 decimal */
const clamp = (v) => Math.min(100, Math.max(0, Math.round(v * 10) / 10));

/** Ratio helper — returns 100 if denominator is 0 (no data = perfect score) */
const ratio = (numerator, denominator) =>
  denominator === 0 ? 100 : clamp((numerator / denominator) * 100);

const getGrade = (score) =>
  score >= 90 ? 'Excellent' :
  score >= 75 ? 'Good' :
  score >= 60 ? 'Fair' :
  score >= 40 ? 'Needs Improvement' : 'Critical';

/**
 * Calculate org-level governance score.
 */
const computeOrgScore = async () => {
  const [
    totalPolicies,
    publishedPolicies,
    totalAudits,
    completedAudits,
    totalIssues,
    resolvedIssues,
    overdueIssues,
  ] = await Promise.all([
    EsgPolicy.countDocuments(),
    EsgPolicy.countDocuments({ status: 'Published' }),
    Audit.countDocuments(),
    Audit.countDocuments({ status: 'Completed' }),
    ComplianceIssue.countDocuments(),
    ComplianceIssue.countDocuments({ status: 'RESOLVED' }),
    ComplianceIssue.countDocuments({ status: 'OPEN', isOverdue: true }),
  ]);

  const policyScore = ratio(publishedPolicies, totalPolicies);
  const auditScore = ratio(completedAudits, totalAudits);
  const overduepenalty = Math.min(30, overdueIssues * 5);
  const complianceScore = clamp(ratio(resolvedIssues, totalIssues) - overduepenalty);

  const score = clamp(
    policyScore * WEIGHTS.policy +
    auditScore * WEIGHTS.audit +
    complianceScore * WEIGHTS.compliance
  );

  return {
    score,
    grade: getGrade(score),
    breakdown: {
      policyScore,
      auditScore,
      complianceScore,
      details: {
        totalPolicies, publishedPolicies,
        totalAudits, completedAudits,
        totalIssues, resolvedIssues, overdueIssues,
      },
    },
  };
};

/**
 * Calculate department-level governance score.
 */
const computeDeptScore = async (deptId) => {
  const [
    totalPolicies,
    publishedPolicies,
    totalAudits,
    completedAudits,
    totalIssues,
    resolvedIssues,
    overdueIssues,
  ] = await Promise.all([
    EsgPolicy.countDocuments(),
    EsgPolicy.countDocuments({ status: 'Published' }),
    Audit.countDocuments({ department: deptId }),
    Audit.countDocuments({ department: deptId, status: 'Completed' }),
    ComplianceIssue.countDocuments({ department: deptId }),
    ComplianceIssue.countDocuments({ department: deptId, status: 'RESOLVED' }),
    ComplianceIssue.countDocuments({ department: deptId, status: 'OPEN', isOverdue: true }),
  ]);

  const policyScore = ratio(publishedPolicies, totalPolicies);
  const auditScore = ratio(completedAudits, totalAudits);
  const overduepenalty = Math.min(30, overdueIssues * 5);
  const complianceScore = clamp(ratio(resolvedIssues, totalIssues) - overduepenalty);

  const score = clamp(
    policyScore * WEIGHTS.policy +
    auditScore * WEIGHTS.audit +
    complianceScore * WEIGHTS.compliance
  );

  return {
    score,
    grade: getGrade(score),
    breakdown: {
      policyScore,
      auditScore,
      complianceScore,
      details: {
        totalPolicies, publishedPolicies,
        totalAudits, completedAudits,
        totalIssues, resolvedIssues, overdueIssues,
      },
    },
  };
};

/**
 * Get scores for ALL active departments (for leaderboard).
 */
const computeAllDeptScores = async () => {
  const departments = await Department.find({ status: 'Active' });
  const results = await Promise.all(
    departments.map(async (dept) => {
      const { score, grade } = await computeDeptScore(dept._id);
      return { _id: dept._id, name: dept.name, code: dept.code, score, grade };
    })
  );
  return results.sort((a, b) => b.score - a.score);
};

module.exports = { computeOrgScore, computeDeptScore, computeAllDeptScores };
