const Department = require('./models/Department.model');
const Category = require('./models/Category.model');
const asyncHandler = require('../../utils/asyncHandler');

const getDashboard = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: 'Dashboard mock data',
    scores: { E: 85, S: 70, G: 75, total: 77 },
    emissions: 1200,
    employees: 42
  });
});

const getScores = asyncHandler(async (req, res) => {
  res.status(200).json([]);
});

const recalculateScores = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'Scores recalculated' });
});

const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find({});
  res.status(200).json(departments);
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
  res.status(200).json({ message: 'Reports data' });
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
