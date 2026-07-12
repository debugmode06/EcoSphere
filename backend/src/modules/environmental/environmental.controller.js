/**
 * Environmental Module — Master Controller
 * Covers: EmissionFactor, CarbonTransaction, Dashboard,
 *         Environmental Goals, Product ESG Profiles,
 *         Analytics, Reports, Search & Filters
 */

const mongoose = require('mongoose');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

const EmissionFactor    = require('../../../models/EmissionFactor');
const CarbonTransaction = require('../../../models/CarbonTransaction');
const EnvironmentalGoal = require('../../../models/EnvironmentalGoal');
const ProductESGProfile = require('./models/ProductESGProfile.model');

// ─────────────────────────────────────────────────
// HELPER: validate MongoDB ObjectId
// ─────────────────────────────────────────────────
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ─────────────────────────────────────────────────
// EMISSION FACTOR — CRUD (unchanged, preserved)
// ─────────────────────────────────────────────────

const getAllEmissionFactors = async (req, res, next) => {
  try {
    const factors = await EmissionFactor.find({ is_active: true }).sort({ activity_name: 1 });
    res.status(200).json({ success: true, count: factors.length, data: factors });
  } catch (err) { next(err); }
};

const getEmissionFactorById = async (req, res, next) => {
  try {
    const factor = await EmissionFactor.findOne({ factor_id: req.params.factorId });
    if (!factor) return res.status(404).json({ success: false, message: 'Emission factor not found' });
    res.status(200).json({ success: true, data: factor });
  } catch (err) { next(err); }
};

const createEmissionFactor = async (req, res, next) => {
  try {
    const factor = await EmissionFactor.create(req.body);
    res.status(201).json({ success: true, message: 'Emission factor created successfully', data: factor });
  } catch (err) { next(err); }
};

const updateEmissionFactor = async (req, res, next) => {
  try {
    const factor = await EmissionFactor.findOneAndUpdate(
      { factor_id: req.params.factorId }, req.body,
      { new: true, runValidators: true }
    );
    if (!factor) return res.status(404).json({ success: false, message: 'Emission factor not found' });
    res.status(200).json({ success: true, message: 'Emission factor updated successfully', data: factor });
  } catch (err) { next(err); }
};

const deactivateEmissionFactor = async (req, res, next) => {
  try {
    const factor = await EmissionFactor.findOneAndUpdate(
      { factor_id: req.params.factorId }, { is_active: false }, { new: true }
    );
    if (!factor) return res.status(404).json({ success: false, message: 'Emission factor not found' });
    res.status(200).json({ success: true, message: 'Emission factor deactivated successfully', data: factor });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────
// CARBON TRANSACTION — CRUD (unchanged, preserved)
// ─────────────────────────────────────────────────

const createCarbonTransaction = async (req, res, next) => {
  try {
    const { emissionFactor, quantity, department, description, transactionDate } = req.body;
    if (!emissionFactor || quantity === undefined)
      return res.status(400).json({ success: false, message: 'Required fields (emissionFactor, quantity) are missing' });
    if (!isValidObjectId(emissionFactor))
      return res.status(400).json({ success: false, message: 'Invalid emission factor ID' });
    const quantityNum = Number(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0)
      return res.status(400).json({ success: false, message: 'Quantity must be a positive number' });
    const factor = await EmissionFactor.findOne({ _id: emissionFactor, is_active: true });
    if (!factor) return res.status(404).json({ success: false, message: 'Active emission factor not found' });
    const transaction = await CarbonTransaction.create({
      emissionFactor, quantity: quantityNum,
      carbonEmission: quantityNum * factor.emission_factor,
      department, description,
      transactionDate: transactionDate || new Date(),
      status: 'active'
    });
    const populated = await CarbonTransaction.findById(transaction._id).populate('emissionFactor');
    res.status(201).json({ success: true, message: 'Carbon transaction created successfully', data: populated });
  } catch (err) { next(err); }
};

const getAllCarbonTransactions = async (req, res, next) => {
  try {
    const filter = { status: { $ne: 'inactive' } };
    const page  = parseInt(req.query.page,  10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip  = (page - 1) * limit;
    let sortBy  = { transactionDate: -1 };
    if (req.query.sortBy) {
      const [field, dir] = req.query.sortBy.split(':');
      sortBy = { [field]: dir === 'desc' ? -1 : 1 };
    }
    const [transactions, total] = await Promise.all([
      CarbonTransaction.find(filter).sort(sortBy).skip(skip).limit(limit).populate('emissionFactor'),
      CarbonTransaction.countDocuments(filter)
    ]);
    res.status(200).json({
      success: true, count: transactions.length,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      data: transactions
    });
  } catch (err) { next(err); }
};

const getCarbonTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid transaction ID' });
    const transaction = await CarbonTransaction.findOne({ _id: id, status: { $ne: 'inactive' } }).populate('emissionFactor');
    if (!transaction) return res.status(404).json({ success: false, message: 'Carbon transaction not found' });
    res.status(200).json({ success: true, data: transaction });
  } catch (err) { next(err); }
};

const updateCarbonTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid transaction ID' });
    const transaction = await CarbonTransaction.findOne({ _id: id, status: { $ne: 'inactive' } });
    if (!transaction) return res.status(404).json({ success: false, message: 'Carbon transaction not found' });
    const updates = req.body;
    if (updates.quantity !== undefined) {
      const n = Number(updates.quantity);
      if (isNaN(n) || n <= 0) return res.status(400).json({ success: false, message: 'Quantity must be a positive number' });
      updates.quantity = n;
    }
    let shouldRecalc = false;
    let factorId  = transaction.emissionFactor;
    let qty       = transaction.quantity;
    if (updates.emissionFactor && updates.emissionFactor.toString() !== transaction.emissionFactor.toString()) {
      if (!isValidObjectId(updates.emissionFactor)) return res.status(400).json({ success: false, message: 'Invalid emission factor ID' });
      factorId = updates.emissionFactor; shouldRecalc = true;
    }
    if (updates.quantity !== undefined && updates.quantity !== transaction.quantity) { qty = updates.quantity; shouldRecalc = true; }
    if (shouldRecalc) {
      const factor = await EmissionFactor.findOne({ _id: factorId, is_active: true });
      if (!factor) return res.status(404).json({ success: false, message: 'Active emission factor not found' });
      updates.carbonEmission = qty * factor.emission_factor;
    }
    const updated = await CarbonTransaction.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).populate('emissionFactor');
    res.status(200).json({ success: true, message: 'Carbon transaction updated successfully', data: updated });
  } catch (err) { next(err); }
};

const deactivateCarbonTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid transaction ID' });
    const transaction = await CarbonTransaction.findOneAndUpdate(
      { _id: id, status: { $ne: 'inactive' } }, { status: 'inactive' }, { new: true }
    );
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found or already deleted' });
    res.status(200).json({ success: true, message: 'Carbon transaction deleted successfully', data: transaction });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────
// DASHBOARD APIs
// ─────────────────────────────────────────────────

// 1. Summary (existing)
const getDashboardSummary = async (req, res, next) => {
  try {
    const carbonStats = await CarbonTransaction.aggregate([
      { $match: { status: { $ne: 'inactive' } } },
      { $group: { _id: null, totalEmission: { $sum: '$carbonEmission' }, totalTransactions: { $sum: 1 } } }
    ]);
    const { totalEmission = 0, totalTransactions = 0 } = carbonStats[0] || {};
    const [activeEmissionFactors, activeGoals] = await Promise.all([
      EmissionFactor.countDocuments({ is_active: true }),
      EnvironmentalGoal.countDocuments({ status: 'ACTIVE' })
    ]);
    res.status(200).json({
      success: true, message: 'Dashboard summary retrieved successfully',
      data: { totalEmission, totalTransactions, activeEmissionFactors, activeGoals }
    });
  } catch (err) { next(err); }
};

// 2. Monthly Emissions (existing)
const getMonthlyEmissions = async (req, res, next) => {
  try {
    const data = await CarbonTransaction.aggregate([
      { $match: { status: { $ne: 'inactive' } } },
      { $group: {
          _id: {
            year:  { $year:  { $ifNull: ['$transactionDate', '$createdAt'] } },
            month: { $month: { $ifNull: ['$transactionDate', '$createdAt'] } }
          },
          totalEmission: { $sum: '$carbonEmission' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $project: { _id: 0, year: '$_id.year', month: '$_id.month', totalEmission: 1 } }
    ]);
    res.status(200).json({ success: true, message: 'Monthly emissions retrieved successfully', data });
  } catch (err) { next(err); }
};

// 3. Department Emissions (existing)
const getDepartmentEmissions = async (req, res, next) => {
  try {
    const data = await CarbonTransaction.aggregate([
      { $match: { status: { $ne: 'inactive' } } },
      { $group: { _id: { $ifNull: ['$department', 'Unknown'] }, totalEmission: { $sum: '$carbonEmission' }, transactionCount: { $sum: 1 } } },
      { $sort: { totalEmission: -1 } },
      { $project: { _id: 0, department: '$_id', totalEmission: 1, transactionCount: 1 } }
    ]);
    res.status(200).json({ success: true, message: 'Department-wise emissions retrieved successfully', count: data.length, data });
  } catch (err) { next(err); }
};

// 4. Category Emissions (NEW)
const getCategoryEmissions = async (req, res, next) => {
  try {
    const data = await CarbonTransaction.aggregate([
      { $match: { status: { $ne: 'inactive' } } },
      { $lookup: { from: 'emissionFactors', localField: 'emissionFactor', foreignField: '_id', as: 'factor' } },
      { $unwind: { path: '$factor', preserveNullAndEmpty: false } },
      { $group: {
          _id: { $ifNull: ['$factor.category', 'Unknown'] },
          totalEmission:    { $sum: '$carbonEmission' },
          transactionCount: { $sum: 1 }
        }
      },
      { $sort: { totalEmission: -1 } },
      { $project: { _id: 0, category: '$_id', totalEmission: 1, transactionCount: 1 } }
    ]);
    res.status(200).json({ success: true, message: 'Category-wise emissions retrieved successfully', count: data.length, data });
  } catch (err) { next(err); }
};

// 5. Recent Transactions (NEW)
const getRecentTransactions = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const data = await CarbonTransaction.find({ status: { $ne: 'inactive' } })
      .sort({ transactionDate: -1 })
      .limit(limit)
      .populate('emissionFactor');
    res.status(200).json({ success: true, message: 'Recent transactions retrieved successfully', count: data.length, data });
  } catch (err) { next(err); }
};

// 6. Top Polluting Departments (NEW)
const getTopDepartments = async (req, res, next) => {
  try {
    const data = await CarbonTransaction.aggregate([
      { $match: { status: { $ne: 'inactive' } } },
      { $group: { _id: { $ifNull: ['$department', 'Unknown'] }, totalEmission: { $sum: '$carbonEmission' }, transactionCount: { $sum: 1 } } },
      { $sort: { totalEmission: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, department: '$_id', totalEmission: 1, transactionCount: 1 } }
    ]);
    res.status(200).json({ success: true, message: 'Top 5 polluting departments retrieved successfully', data });
  } catch (err) { next(err); }
};

// 7. Dashboard Cards (NEW)
const getDashboardCards = async (req, res, next) => {
  try {
    const [carbonStats, activeGoals, activeFactors, deptStats, categoryStats] = await Promise.all([
      CarbonTransaction.aggregate([
        { $match: { status: { $ne: 'inactive' } } },
        { $group: { _id: null, totalEmission: { $sum: '$carbonEmission' }, totalTransactions: { $sum: 1 } } }
      ]),
      EnvironmentalGoal.countDocuments({ status: 'ACTIVE' }),
      EmissionFactor.countDocuments({ is_active: true }),
      CarbonTransaction.distinct('department', { status: { $ne: 'inactive' } }),
      CarbonTransaction.aggregate([
        { $match: { status: { $ne: 'inactive' } } },
        { $lookup: { from: 'emissionFactors', localField: 'emissionFactor', foreignField: '_id', as: 'ef' } },
        { $unwind: { path: '$ef', preserveNullAndEmpty: false } },
        { $group: { _id: '$ef.category' } },
        { $count: 'count' }
      ])
    ]);
    const { totalEmission = 0, totalTransactions = 0 } = carbonStats[0] || {};
    const categoryCount = categoryStats[0]?.count || 0;
    res.status(200).json({
      success: true, message: 'Dashboard cards retrieved successfully',
      data: {
        totalCarbonEmission:   totalEmission,
        totalTransactions,
        activeGoals,
        activeEmissionFactors: activeFactors,
        departmentCount:       deptStats.filter(Boolean).length,
        categoryCount
      }
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────
// ENVIRONMENTAL GOALS — CRUD + Progress
// ─────────────────────────────────────────────────

const createGoal = async (req, res, next) => {
  try {
    const { goal_id, goal_name, department_id, goal_type, target_reduction,
            baseline_emission_kg_co2e, target_emission_kg_co2e,
            start_date, end_date } = req.body;
    if (!goal_id || !goal_name || !department_id || !baseline_emission_kg_co2e || !target_emission_kg_co2e || !start_date || !end_date)
      return res.status(400).json({ success: false, message: 'Missing required goal fields' });
    if (baseline_emission_kg_co2e <= 0 || target_emission_kg_co2e < 0)
      return res.status(400).json({ success: false, message: 'Emission values must be positive numbers' });
    const existing = await EnvironmentalGoal.findOne({ goal_id });
    if (existing) return res.status(409).json({ success: false, message: `Goal with ID '${goal_id}' already exists` });
    const goal = await EnvironmentalGoal.create({
      goal_id, goal_name, department_id,
      goal_type: goal_type || 'REDUCTION',
      target_reduction: target_reduction || 0,
      baseline_emission_kg_co2e, target_emission_kg_co2e,
      start_date: new Date(start_date), end_date: new Date(end_date),
      status: 'ACTIVE'
    });
    res.status(201).json({ success: true, message: 'Environmental goal created successfully', data: goal });
  } catch (err) { next(err); }
};

const getAllGoals = async (req, res, next) => {
  try {
    const { status, department_id, search, sortBy = 'createdAt:desc' } = req.query;
    const page  = parseInt(req.query.page,  10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip  = (page - 1) * limit;
    const filter = {};
    if (status)        filter.status        = status.toUpperCase();
    if (department_id) filter.department_id = department_id;
    if (search)        filter.goal_name     = { $regex: search, $options: 'i' };
    const [field, dir] = sortBy.split(':');
    const sort = { [field]: dir === 'desc' ? -1 : 1 };
    const [goals, total] = await Promise.all([
      EnvironmentalGoal.find(filter).sort(sort).skip(skip).limit(limit),
      EnvironmentalGoal.countDocuments(filter)
    ]);
    res.status(200).json({
      success: true, count: goals.length,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      data: goals
    });
  } catch (err) { next(err); }
};

const getGoalById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid goal ID' });
    const goal = await EnvironmentalGoal.findById(id);
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.status(200).json({ success: true, data: goal });
  } catch (err) { next(err); }
};

const updateGoal = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid goal ID' });
    const goal = await EnvironmentalGoal.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.status(200).json({ success: true, message: 'Goal updated successfully', data: goal });
  } catch (err) { next(err); }
};

const deleteGoal = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid goal ID' });
    const goal = await EnvironmentalGoal.findByIdAndUpdate(id, { status: 'NOT_ACHIEVED' }, { new: true });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.status(200).json({ success: true, message: 'Goal deactivated (soft delete)', data: goal });
  } catch (err) { next(err); }
};

// GET /goals/progress
const getGoalProgress = async (req, res, next) => {
  try {
    const goals = await EnvironmentalGoal.find({ status: { $ne: 'NOT_ACHIEVED' } });
    let achieved = 0;
    const progress = goals.map(g => {
      const current = g.baseline_emission_kg_co2e; // Placeholder — link to real tx data if needed
      const target  = g.target_emission_kg_co2e;
      const baseline = g.baseline_emission_kg_co2e;
      const remaining = Math.max(0, current - target);
      const achievementPct = baseline > 0
        ? Math.min(100, ((baseline - current) / (baseline - target)) * 100)
        : 0;
      const goalStatus = achievementPct >= 100 ? 'ACHIEVED' : 'IN_PROGRESS';
      if (goalStatus === 'ACHIEVED') achieved++;
      return {
        goal_id:       g.goal_id,
        goal_name:     g.goal_name,
        department_id: g.department_id,
        baselineEmission:    baseline,
        targetEmission:      target,
        currentEmission:     current,
        remainingEmission:   remaining,
        achievementPercent:  Math.round(achievementPct * 100) / 100,
        goalStatus
      };
    });
    res.status(200).json({
      success: true, message: 'Goal progress retrieved successfully',
      summary: { totalGoals: goals.length, achievedGoals: achieved, achievementRate: goals.length > 0 ? Math.round((achieved / goals.length) * 100) : 0 },
      data: progress
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────
// PRODUCT ESG PROFILE — CRUD
// ─────────────────────────────────────────────────

const createProduct = async (req, res, next) => {
  try {
    const { product_id, product_name, category } = req.body;
    if (!product_id || !product_name || !category)
      return res.status(400).json({ success: false, message: 'product_id, product_name, and category are required' });
    const existing = await ProductESGProfile.findOne({ product_id });
    if (existing) return res.status(409).json({ success: false, message: `Product with ID '${product_id}' already exists` });
    const product = await ProductESGProfile.create(req.body);
    res.status(201).json({ success: true, message: 'Product ESG Profile created successfully', data: product });
  } catch (err) { next(err); }
};

const getAllProducts = async (req, res, next) => {
  try {
    const { category, supplier, search, sortBy = 'createdAt:desc' } = req.query;
    const page  = parseInt(req.query.page,  10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip  = (page - 1) * limit;
    const filter = { status: { $ne: 'inactive' } };
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (supplier) filter.supplier = { $regex: supplier, $options: 'i' };
    if (search)   filter.product_name = { $regex: search, $options: 'i' };
    const [field, dir] = sortBy.split(':');
    const sort = { [field]: dir === 'desc' ? -1 : 1 };
    const [products, total] = await Promise.all([
      ProductESGProfile.find(filter).sort(sort).skip(skip).limit(limit),
      ProductESGProfile.countDocuments(filter)
    ]);
    res.status(200).json({
      success: true, count: products.length,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      data: products
    });
  } catch (err) { next(err); }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid product ID' });
    const product = await ProductESGProfile.findOne({ _id: id, status: { $ne: 'inactive' } });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, data: product });
  } catch (err) { next(err); }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid product ID' });
    const product = await ProductESGProfile.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, message: 'Product updated successfully', data: product });
  } catch (err) { next(err); }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid product ID' });
    const product = await ProductESGProfile.findByIdAndUpdate(id, { status: 'inactive' }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, message: 'Product deleted (soft delete)', data: product });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────
// ANALYTICS — MongoDB Aggregation Pipelines
// ─────────────────────────────────────────────────

const getAnalyticsMonthly = async (req, res, next) => {
  try {
    const data = await CarbonTransaction.aggregate([
      { $match: { status: { $ne: 'inactive' } } },
      { $group: {
          _id: { year: { $year: { $ifNull: ['$transactionDate', '$createdAt'] } }, month: { $month: { $ifNull: ['$transactionDate', '$createdAt'] } } },
          totalEmission: { $sum: '$carbonEmission' }, transactionCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $project: { _id: 0, year: '$_id.year', month: '$_id.month', totalEmission: 1, transactionCount: 1 } }
    ]);
    res.status(200).json({ success: true, message: 'Monthly analytics retrieved', data });
  } catch (err) { next(err); }
};

const getAnalyticsYearly = async (req, res, next) => {
  try {
    const data = await CarbonTransaction.aggregate([
      { $match: { status: { $ne: 'inactive' } } },
      { $group: {
          _id: { $year: { $ifNull: ['$transactionDate', '$createdAt'] } },
          totalEmission: { $sum: '$carbonEmission' }, transactionCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, year: '$_id', totalEmission: 1, transactionCount: 1 } }
    ]);
    res.status(200).json({ success: true, message: 'Yearly analytics retrieved', data });
  } catch (err) { next(err); }
};

const getAnalyticsDepartments = async (req, res, next) => {
  try {
    const data = await CarbonTransaction.aggregate([
      { $match: { status: { $ne: 'inactive' } } },
      { $group: { _id: { $ifNull: ['$department', 'Unknown'] }, totalEmission: { $sum: '$carbonEmission' }, transactionCount: { $sum: 1 } } },
      { $sort: { totalEmission: -1 } },
      { $project: { _id: 0, department: '$_id', totalEmission: 1, transactionCount: 1 } }
    ]);
    res.status(200).json({ success: true, message: 'Department analytics retrieved', data });
  } catch (err) { next(err); }
};

const getAnalyticsCategories = async (req, res, next) => {
  try {
    const data = await CarbonTransaction.aggregate([
      { $match: { status: { $ne: 'inactive' } } },
      { $lookup: { from: 'emissionFactors', localField: 'emissionFactor', foreignField: '_id', as: 'ef' } },
      { $unwind: { path: '$ef', preserveNullAndEmpty: false } },
      { $group: { _id: { $ifNull: ['$ef.category', 'Unknown'] }, totalEmission: { $sum: '$carbonEmission' }, transactionCount: { $sum: 1 } } },
      { $sort: { totalEmission: -1 } },
      { $project: { _id: 0, category: '$_id', totalEmission: 1, transactionCount: 1 } }
    ]);
    res.status(200).json({ success: true, message: 'Category analytics retrieved', data });
  } catch (err) { next(err); }
};

const getHighestMonth = async (req, res, next) => {
  try {
    const data = await CarbonTransaction.aggregate([
      { $match: { status: { $ne: 'inactive' } } },
      { $group: { _id: { year: { $year: { $ifNull: ['$transactionDate', '$createdAt'] } }, month: { $month: { $ifNull: ['$transactionDate', '$createdAt'] } } }, totalEmission: { $sum: '$carbonEmission' } } },
      { $sort: { totalEmission: -1 } },
      { $limit: 1 },
      { $project: { _id: 0, year: '$_id.year', month: '$_id.month', totalEmission: 1 } }
    ]);
    res.status(200).json({ success: true, message: 'Highest emission month retrieved', data: data[0] || null });
  } catch (err) { next(err); }
};

const getLowestMonth = async (req, res, next) => {
  try {
    const data = await CarbonTransaction.aggregate([
      { $match: { status: { $ne: 'inactive' } } },
      { $group: { _id: { year: { $year: { $ifNull: ['$transactionDate', '$createdAt'] } }, month: { $month: { $ifNull: ['$transactionDate', '$createdAt'] } } }, totalEmission: { $sum: '$carbonEmission' } } },
      { $sort: { totalEmission: 1 } },
      { $limit: 1 },
      { $project: { _id: 0, year: '$_id.year', month: '$_id.month', totalEmission: 1 } }
    ]);
    res.status(200).json({ success: true, message: 'Lowest emission month retrieved', data: data[0] || null });
  } catch (err) { next(err); }
};

const getAverageMonthly = async (req, res, next) => {
  try {
    const data = await CarbonTransaction.aggregate([
      { $match: { status: { $ne: 'inactive' } } },
      { $group: { _id: { year: { $year: { $ifNull: ['$transactionDate', '$createdAt'] } }, month: { $month: { $ifNull: ['$transactionDate', '$createdAt'] } } }, monthTotal: { $sum: '$carbonEmission' } } },
      { $group: { _id: null, averageMonthlyEmission: { $avg: '$monthTotal' }, totalMonths: { $sum: 1 } } },
      { $project: { _id: 0, averageMonthlyEmission: { $round: ['$averageMonthlyEmission', 2] }, totalMonths: 1 } }
    ]);
    res.status(200).json({ success: true, message: 'Average monthly emission retrieved', data: data[0] || { averageMonthlyEmission: 0, totalMonths: 0 } });
  } catch (err) { next(err); }
};

const getKPI = async (req, res, next) => {
  try {
    const [carbonStats, goalStats, topDept] = await Promise.all([
      CarbonTransaction.aggregate([
        { $match: { status: { $ne: 'inactive' } } },
        { $group: { _id: null, totalEmission: { $sum: '$carbonEmission' } } }
      ]),
      EnvironmentalGoal.aggregate([
        { $group: { _id: null, total: { $sum: 1 }, achieved: { $sum: { $cond: [{ $eq: ['$status', 'ACHIEVED'] }, 1, 0] } } } }
      ]),
      CarbonTransaction.aggregate([
        { $match: { status: { $ne: 'inactive' } } },
        { $group: { _id: { $ifNull: ['$department', 'Unknown'] }, totalEmission: { $sum: '$carbonEmission' } } },
        { $sort: { totalEmission: -1 } }, { $limit: 1 }
      ])
    ]);

    const totalEmission = carbonStats[0]?.totalEmission || 0;
    const monthly = await CarbonTransaction.aggregate([
      { $match: { status: { $ne: 'inactive' } } },
      { $group: { _id: { year: { $year: { $ifNull: ['$transactionDate', '$createdAt'] } }, month: { $month: { $ifNull: ['$transactionDate', '$createdAt'] } } }, m: { $sum: '$carbonEmission' } } },
      { $group: { _id: null, avg: { $avg: '$m' } } }
    ]);
    const goalAchievementRate = goalStats[0]?.total > 0
      ? Math.round((goalStats[0].achieved / goalStats[0].total) * 100)
      : 0;

    res.status(200).json({
      success: true, message: 'Environmental KPIs retrieved',
      data: {
        totalEmission,
        averageMonthlyEmission: Math.round((monthly[0]?.avg || 0) * 100) / 100,
        highestEmissionDepartment: topDept[0]?._id || 'N/A',
        goalAchievementRate: `${goalAchievementRate}%`,
        carbonReductionPercentage: 'Requires baseline data'
      }
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────
// SEARCH & FILTERS
// ─────────────────────────────────────────────────
const searchTransactions = async (req, res, next) => {
  try {
    const { department, category, keyword, month, year, startDate, endDate, sortBy = 'transactionDate:desc' } = req.query;
    const page  = parseInt(req.query.page,  10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip  = (page - 1) * limit;

    const pipeline = [];

    // Join emission factor for category filtering
    pipeline.push({ $match: { status: { $ne: 'inactive' } } });
    pipeline.push({ $lookup: { from: 'emissionFactors', localField: 'emissionFactor', foreignField: '_id', as: 'ef' } });
    pipeline.push({ $unwind: { path: '$ef', preserveNullAndEmpty: true } });

    const matchStage = {};
    if (department) matchStage.department = { $regex: department, $options: 'i' };
    if (keyword)    matchStage.description = { $regex: keyword, $options: 'i' };
    if (category)   matchStage['ef.category'] = { $regex: category, $options: 'i' };
    if (year)       matchStage.$expr = { $eq: [{ $year: { $ifNull: ['$transactionDate', '$createdAt'] } }, parseInt(year)] };
    if (month && !year) matchStage.$expr = { $eq: [{ $month: { $ifNull: ['$transactionDate', '$createdAt'] } }, parseInt(month)] };
    if (startDate || endDate) {
      matchStage.transactionDate = {};
      if (startDate) matchStage.transactionDate.$gte = new Date(startDate);
      if (endDate)   matchStage.transactionDate.$lte = new Date(endDate);
    }
    if (Object.keys(matchStage).length) pipeline.push({ $match: matchStage });

    const [field, dir] = sortBy.split(':');
    pipeline.push({ $sort: { [field]: dir === 'desc' ? -1 : 1 } });

    const countPipeline = [...pipeline, { $count: 'total' }];
    pipeline.push({ $skip: skip }, { $limit: limit });

    const [data, countResult] = await Promise.all([
      CarbonTransaction.aggregate(pipeline),
      CarbonTransaction.aggregate(countPipeline)
    ]);
    const total = countResult[0]?.total || 0;

    res.status(200).json({
      success: true, count: data.length,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      data
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────
// REPORTS — JSON / CSV / PDF
// ─────────────────────────────────────────────────

// Helper: send CSV
const sendCSV = (res, data, filename, fields) => {
  const parser = new Parser({ fields });
  const csv = parser.parse(data);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
};

// Helper: send PDF
const sendPDF = (res, title, rows) => {
  const doc = new PDFDocument({ margin: 40 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s/g, '_')}.pdf"`);
  doc.pipe(res);
  doc.fontSize(18).text(title, { align: 'center' });
  doc.moveDown();
  rows.forEach(row => {
    doc.fontSize(10).text(JSON.stringify(row));
    doc.moveDown(0.3);
  });
  doc.end();
};

// GET /reports/carbon
const getCarbonReport = async (req, res, next) => {
  try {
    const format = req.query.format || 'json';
    const transactions = await CarbonTransaction.find({ status: { $ne: 'inactive' } }).populate('emissionFactor').lean();
    if (format === 'csv') {
      const fields = ['department', 'quantity', 'carbonEmission', 'transactionDate', 'description'];
      return sendCSV(res, transactions, 'carbon_report.csv', fields);
    }
    if (format === 'pdf') return sendPDF(res, 'Carbon Emissions Report', transactions);
    res.status(200).json({ success: true, message: 'Carbon report generated', count: transactions.length, data: transactions });
  } catch (err) { next(err); }
};

// GET /reports/monthly
const getMonthlyReport = async (req, res, next) => {
  try {
    const format = req.query.format || 'json';
    const data = await CarbonTransaction.aggregate([
      { $match: { status: { $ne: 'inactive' } } },
      { $group: { _id: { year: { $year: { $ifNull: ['$transactionDate', '$createdAt'] } }, month: { $month: { $ifNull: ['$transactionDate', '$createdAt'] } } }, totalEmission: { $sum: '$carbonEmission' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $project: { _id: 0, year: '$_id.year', month: '$_id.month', totalEmission: 1, count: 1 } }
    ]);
    if (format === 'csv') return sendCSV(res, data, 'monthly_report.csv', ['year', 'month', 'totalEmission', 'count']);
    if (format === 'pdf') return sendPDF(res, 'Monthly Emissions Report', data);
    res.status(200).json({ success: true, message: 'Monthly report generated', data });
  } catch (err) { next(err); }
};

// GET /reports/department
const getDepartmentReport = async (req, res, next) => {
  try {
    const format = req.query.format || 'json';
    const data = await CarbonTransaction.aggregate([
      { $match: { status: { $ne: 'inactive' } } },
      { $group: { _id: { $ifNull: ['$department', 'Unknown'] }, totalEmission: { $sum: '$carbonEmission' }, count: { $sum: 1 } } },
      { $sort: { totalEmission: -1 } },
      { $project: { _id: 0, department: '$_id', totalEmission: 1, count: 1 } }
    ]);
    if (format === 'csv') return sendCSV(res, data, 'department_report.csv', ['department', 'totalEmission', 'count']);
    if (format === 'pdf') return sendPDF(res, 'Department Emissions Report', data);
    res.status(200).json({ success: true, message: 'Department report generated', data });
  } catch (err) { next(err); }
};

// GET /reports/goals
const getGoalReport = async (req, res, next) => {
  try {
    const format = req.query.format || 'json';
    const goals = await EnvironmentalGoal.find().lean();
    if (format === 'csv') return sendCSV(res, goals, 'goals_report.csv', ['goal_id', 'goal_name', 'department_id', 'status', 'baseline_emission_kg_co2e', 'target_emission_kg_co2e']);
    if (format === 'pdf') return sendPDF(res, 'Environmental Goals Report', goals);
    res.status(200).json({ success: true, message: 'Goals report generated', count: goals.length, data: goals });
  } catch (err) { next(err); }
};

// GET /reports/esg-summary
const getESGSummaryReport = async (req, res, next) => {
  try {
    const format = req.query.format || 'json';
    const [carbonStats, goalStats, productStats] = await Promise.all([
      CarbonTransaction.aggregate([{ $match: { status: { $ne: 'inactive' } } }, { $group: { _id: null, totalEmission: { $sum: '$carbonEmission' }, totalTransactions: { $sum: 1 } } }]),
      EnvironmentalGoal.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      ProductESGProfile.aggregate([{ $match: { status: { $ne: 'inactive' } } }, { $group: { _id: null, count: { $sum: 1 }, avgCarbonFootprint: { $avg: '$carbon_footprint' }, avgLifecycleScore: { $avg: '$lifecycle_score' } } }])
    ]);
    const summary = {
      totalCarbonEmission:   carbonStats[0]?.totalEmission    || 0,
      totalTransactions:     carbonStats[0]?.totalTransactions || 0,
      goalsByStatus:         goalStats,
      totalProducts:         productStats[0]?.count            || 0,
      avgCarbonFootprint:    Math.round((productStats[0]?.avgCarbonFootprint || 0) * 100) / 100,
      avgLifecycleScore:     Math.round((productStats[0]?.avgLifecycleScore  || 0) * 100) / 100,
      generatedAt:           new Date().toISOString()
    };
    if (format === 'csv') return sendCSV(res, [summary], 'esg_summary.csv', Object.keys(summary));
    if (format === 'pdf') return sendPDF(res, 'ESG Summary Report', [summary]);
    res.status(200).json({ success: true, message: 'ESG summary report generated', data: summary });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────
module.exports = {
  // Emission Factors
  getAllEmissionFactors, getEmissionFactorById, createEmissionFactor,
  updateEmissionFactor, deactivateEmissionFactor,
  // Carbon Transactions
  createCarbonTransaction, getAllCarbonTransactions, getCarbonTransactionById,
  updateCarbonTransaction, deactivateCarbonTransaction,
  // Dashboard
  getDashboardSummary, getMonthlyEmissions, getDepartmentEmissions,
  getCategoryEmissions, getRecentTransactions, getTopDepartments, getDashboardCards,
  // Goals
  createGoal, getAllGoals, getGoalById, updateGoal, deleteGoal, getGoalProgress,
  // Products
  createProduct, getAllProducts, getProductById, updateProduct, deleteProduct,
  // Analytics
  getAnalyticsMonthly, getAnalyticsYearly, getAnalyticsDepartments,
  getAnalyticsCategories, getHighestMonth, getLowestMonth, getAverageMonthly, getKPI,
  // Reports
  getCarbonReport, getMonthlyReport, getDepartmentReport, getGoalReport, getESGSummaryReport,
  // Search
  searchTransactions
};