import client from './axiosClient';

// Challenges
export const getChallenges = (params) => client.get('/gamification/challenges', { params });
export const getChallengeById = (id) => client.get(`/gamification/challenges/${id}`);
export const createChallenge = (data) => client.post('/gamification/challenges', data);
export const updateChallenge = (id, data) => client.put(`/gamification/challenges/${id}`, data);
export const deleteChallenge = (id) => client.delete(`/gamification/challenges/${id}`);
export const joinChallenge = (id) => client.post(`/gamification/challenges/${id}/join`);
export const submitProof = (id, data) => client.post(`/gamification/challenges/${id}/submit-proof`, data);
export const updateChallengeStatus = (id, status) => client.put(`/gamification/challenges/${id}/status`, { status });

// Participations (Admin/Manager review)
export const getParticipations = (params) => client.get('/gamification/participations', { params });
export const approveParticipation = (id) => client.post(`/gamification/participations/${id}/approve`);
export const rejectParticipation = (id) => client.post(`/gamification/participations/${id}/reject`);

// My Participations (Employee own history)
export const getMyParticipations = () => client.get('/gamification/challenges/my-participations');

// Badges
export const getBadges = () => client.get('/gamification/badges');
export const createBadge = (data) => client.post('/gamification/badges', data);
export const updateBadge = (id, data) => client.put(`/gamification/badges/${id}`, data);
export const deleteBadge = (id) => client.delete(`/gamification/badges/${id}`);

// Rewards
export const getRewards = () => client.get('/gamification/rewards');
export const createReward = (data) => client.post('/gamification/rewards', data);
export const updateReward = (id, data) => client.put(`/gamification/rewards/${id}`, data);
export const deleteReward = (id) => client.delete(`/gamification/rewards/${id}`);
export const redeemReward = (id) => client.post(`/gamification/rewards/${id}/redeem`);

// Leaderboards (Unified `/leaderboard/:type`)
export const getLeaderboardOrg = (params) => client.get('/gamification/leaderboard/organization', { params });
export const getLeaderboardDept = (deptId, params) => client.get('/gamification/leaderboard/department', { params: { ...params, department: deptId } });
export const getLeaderboardMonthly = (params) => client.get('/gamification/leaderboard/monthly', { params });
export const getLeaderboardYearly = (params) => client.get('/gamification/leaderboard/yearly', { params });
