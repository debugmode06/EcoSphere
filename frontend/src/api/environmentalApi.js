import client from './axiosClient';

const BASE = '/environmental';

// ── Dashboard ─────────────────────────────────────────────────────────────
export const getDashboardSummary     = ()       => client.get(`${BASE}/dashboard/summary`);
export const getDashboardCards       = ()       => client.get(`${BASE}/dashboard/cards`);
export const getMonthlyEmissions     = ()       => client.get(`${BASE}/dashboard/monthly-emissions`);
export const getDepartmentEmissions  = ()       => client.get(`${BASE}/dashboard/department-emissions`);
export const getCategoryEmissions    = ()       => client.get(`${BASE}/dashboard/category-emissions`);
export const getRecentTransactions   = (limit)  => client.get(`${BASE}/dashboard/recent-transactions`, { params: { limit } });
export const getTopDepartments       = ()       => client.get(`${BASE}/dashboard/top-departments`);

// ── Emission Factors ──────────────────────────────────────────────────────
export const getEmissionFactors    = ()         => client.get(`${BASE}/emission-factors`);
export const getEmissionFactorById = (id)       => client.get(`${BASE}/emission-factors/${id}`);
export const createEmissionFactor  = (data)     => client.post(`${BASE}/emission-factors`, data);
export const updateEmissionFactor  = (id, data) => client.put(`${BASE}/emission-factors/${id}`, data);
export const deleteEmissionFactor  = (id)       => client.delete(`${BASE}/emission-factors/${id}`);

// ── Carbon Transactions ───────────────────────────────────────────────────
export const getTransactions    = (params)     => client.get(`${BASE}/carbon-transactions`, { params });
export const getTransactionById = (id)         => client.get(`${BASE}/carbon-transactions/${id}`);
export const createTransaction  = (data)       => client.post(`${BASE}/carbon-transactions`, data);
export const updateTransaction  = (id, data)   => client.put(`${BASE}/carbon-transactions/${id}`, data);
export const deleteTransaction  = (id)         => client.delete(`${BASE}/carbon-transactions/${id}`);

// ── Environmental Goals ───────────────────────────────────────────────────
export const getGoals         = (params)     => client.get(`${BASE}/goals`, { params });
export const getGoalById      = (id)         => client.get(`${BASE}/goals/${id}`);
export const createGoal       = (data)       => client.post(`${BASE}/goals`, data);
export const updateGoal       = (id, data)   => client.put(`${BASE}/goals/${id}`, data);
export const deleteGoal       = (id)         => client.delete(`${BASE}/goals/${id}`);
export const getGoalProgress  = ()           => client.get(`${BASE}/goals/progress`);
