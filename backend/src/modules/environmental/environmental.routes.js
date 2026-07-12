/**
 * Environmental Module — Master Routes
 */
const express = require('express');
const router  = express.Router();

const {
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
} = require('./environmental.controller');

// ── Emission Factors ──────────────────────────────────────────────────────────
router.get('/emission-factors',              getAllEmissionFactors);
router.get('/emission-factors/:factorId',    getEmissionFactorById);
router.post('/emission-factors',             createEmissionFactor);
router.put('/emission-factors/:factorId',    updateEmissionFactor);
router.delete('/emission-factors/:factorId', deactivateEmissionFactor);

// ── Carbon Transactions ───────────────────────────────────────────────────────
router.post('/carbon-transactions',        createCarbonTransaction);
router.get('/carbon-transactions',         getAllCarbonTransactions);
router.get('/carbon-transactions/:id',     getCarbonTransactionById);
router.put('/carbon-transactions/:id',     updateCarbonTransaction);
router.delete('/carbon-transactions/:id',  deactivateCarbonTransaction);

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get('/dashboard/summary',              getDashboardSummary);
router.get('/dashboard/monthly-emissions',    getMonthlyEmissions);
router.get('/dashboard/department-emissions', getDepartmentEmissions);
router.get('/dashboard/category-emissions',   getCategoryEmissions);
router.get('/dashboard/recent-transactions',  getRecentTransactions);
router.get('/dashboard/top-departments',      getTopDepartments);
router.get('/dashboard/cards',                getDashboardCards);

// ── Environmental Goals ───────────────────────────────────────────────────────
// NOTE: /goals/progress must come BEFORE /goals/:id to avoid route collision
router.get('/goals/progress', getGoalProgress);
router.post('/goals',         createGoal);
router.get('/goals',          getAllGoals);
router.get('/goals/:id',      getGoalById);
router.put('/goals/:id',      updateGoal);
router.delete('/goals/:id',   deleteGoal);

// ── Product ESG Profiles ──────────────────────────────────────────────────────
router.post('/products',       createProduct);
router.get('/products',        getAllProducts);
router.get('/products/:id',    getProductById);
router.put('/products/:id',    updateProduct);
router.delete('/products/:id', deleteProduct);

// ── Analytics ─────────────────────────────────────────────────────────────────
router.get('/analytics/monthly',         getAnalyticsMonthly);
router.get('/analytics/yearly',          getAnalyticsYearly);
router.get('/analytics/departments',     getAnalyticsDepartments);
router.get('/analytics/categories',      getAnalyticsCategories);
router.get('/analytics/highest-month',   getHighestMonth);
router.get('/analytics/lowest-month',    getLowestMonth);
router.get('/analytics/average-monthly', getAverageMonthly);
router.get('/analytics/kpi',             getKPI);

// ── Reports ───────────────────────────────────────────────────────────────────
// Supports ?format=json|csv|pdf
router.get('/reports/carbon',      getCarbonReport);
router.get('/reports/monthly',     getMonthlyReport);
router.get('/reports/department',  getDepartmentReport);
router.get('/reports/goals',       getGoalReport);
router.get('/reports/esg-summary', getESGSummaryReport);

// ── Search & Filters ──────────────────────────────────────────────────────────
router.get('/search', searchTransactions);

module.exports = router;