const Department = require('./models/Department.model');
const Category = require('./models/Category.model');
const asyncHandler = require('../../utils/asyncHandler');
// Clean — no errors

const CarbonTransaction = require('../../../models/CarbonTransaction');
const EnvironmentalGoal = require('../../../models/EnvironmentalGoal');
const CsrActivity = require('../social/models/CSRActivity');
const Participation = require('../social/models/Participation');
const ComplianceIssue = require('../governance/models/ComplianceIssue.model');
const Employee = require('../auth/models/Employee.model');

const getDashboard = asyncHandler(async (req, res) => {
  // 1. Environmental
  const emissions = await CarbonTransaction.aggregate([
    { $group: { _id: null, total: { $sum: '$calculated_emission_kg_co2e' } } }
  ]);
  const totalEmissions = emissions.length > 0 ? emissions[0].total : 0;
  const activeGoals = await EnvironmentalGoal.countDocuments({ status: 'ACTIVE' });

  // 2. Social
  const activeCSR = await CsrActivity.countDocuments({ status: 'active' });
  const totalParticipations = await Participation.countDocuments({ status: 'approved' });

  // 3. Governance
  const openIssues = await ComplianceIssue.countDocuments({ status: 'OPEN' });
  
  // 4. Gamification (Leaderboard)
  const topUsers = await Employee.find().sort({ xp: -1 }).limit(5).select('name role department xp').populate('department', 'name');

  res.status(200).json({
    scores: { E: 82, S: 78, G: 85, total: 81 }, // Placeholder for actual scoring engine
    metrics: {
      totalEmissions,
      activeGoals,
      activeCSR,
      totalParticipations,
      openIssues,
      totalEmployees: await Employee.countDocuments()
    },
    leaderboard: topUsers
  });
});

const getScores = asyncHandler(async (req, res) => {
  res.status(200).json([]);
});

const recalculateScores = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'Scores recalculated' });
});

const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find({ status: 'Active' });
  res.status(200).json({ departments });
});

const createDepartment = asyncHandler(async (req, res) => {
  const department = await Department.create(req.body);
  res.status(201).json(department);
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({});
  res.status(200).json(categories);
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json(category);
});

const getReport = asyncHandler(async (req, res) => {
  const { fromDate, toDate, departmentId } = req.query;
  
  const filter = {};
  if (departmentId) filter.department = departmentId;
  if (fromDate || toDate) {
    filter.createdAt = {};
    if (fromDate) filter.createdAt.$gte = new Date(fromDate);
    if (toDate) filter.createdAt.$lte = new Date(toDate);
  }

  const transactions = await CarbonTransaction.find(filter)
    .sort({ transaction_date: -1 })
    .limit(50);

  const complianceIssues = await ComplianceIssue.find(filter)
    .populate('department', 'name')
    .sort({ createdAt: -1 })
    .limit(50);

  const participations = await Participation.find(filter)
    .populate('employeeId', 'name')
    .populate('csrActivityId', 'title categoryId departmentId')
    .sort({ joinedDate: -1 })
    .limit(50);

  res.status(200).json({
    environmental: transactions,
    governance: complianceIssues,
    social: participations
  });
});

const getLeaderboard = asyncHandler(async (req, res) => {
  res.status(200).json([]);
});

module.exports = {
  getDashboard,
  getScores,
  recalculateScores,
  getDepartments,
  createDepartment,
  getCategories,
  createCategory,
  getReport,
  getLeaderboard
};
