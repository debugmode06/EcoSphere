import client from './axiosClient';

export const getEmissionFactors = () => client.get('/environmental/emission-factors');
export const createEmissionFactor = (data) => client.post('/environmental/emission-factors', data);
export const getTransactions = (params) => client.get('/environmental/carbon-transactions', { params });
export const createTransaction = (data) => client.post('/environmental/carbon-transactions', data);
export const getGoals = () => client.get('/environmental/goals');
export const createGoal = (data) => client.post('/environmental/goals', data);
export const updateGoalProgress = (id, currentValue) => client.patch(`/environmental/goals/${id}/progress`, { currentValue });
