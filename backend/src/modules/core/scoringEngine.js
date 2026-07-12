// TODO (Person 4): Implement scoring engine
// Formula: totalScore = E * weights.environmental + S * weights.social + G * weights.governance
// Then orgScore = average of all departmentScores.totalScore
// Default weights: { environmental: 0.4, social: 0.3, governance: 0.3 } — from utils/weightConfig.js

const { DEFAULT_WEIGHTS } = require('../../utils/weightConfig');

const recalculate = async (weights = DEFAULT_WEIGHTS) => {
  // TODO: fetch DepartmentScore docs, compute totalScore, save, return { orgScore, departmentScores }
  return { orgScore: 0, departmentScores: [] };
};

module.exports = { recalculate };
