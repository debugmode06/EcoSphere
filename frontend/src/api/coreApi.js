import client from './axiosClient';

export const getDashboard = () => client.get('/core/dashboard');
export const getScores = () => client.get('/core/scores');
export const recalculateScores = (weights) => client.post('/core/scores/recalculate', { weights });
export const getDepartments = () => client.get('/core/departments');
export const createDepartment = (data) => client.post('/core/departments', data);
export const getCategories = () => client.get('/core/categories');
export const createCategory = (data) => client.post('/core/categories', data);
export const getReport = (params) => client.get('/core/reports', { params });
export const getLeaderboard = () => client.get('/core/leaderboard');
