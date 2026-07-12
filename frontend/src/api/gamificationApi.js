import client from './axiosClient';

export const getChallenges = (params) => client.get('/gamification/challenges', { params });
export const createChallenge = (data) => client.post('/gamification/challenges', data);
export const joinChallenge = (data) => client.post('/gamification/challenges/join', data);
export const approveParticipation = (id, data) => client.patch(`/gamification/challenges/participations/${id}/approve`, data);
export const getBadges = () => client.get('/gamification/badges');
export const createBadge = (data) => client.post('/gamification/badges', data);
export const getRewards = () => client.get('/gamification/rewards');
export const createReward = (data) => client.post('/gamification/rewards', data);
export const redeemReward = (id) => client.post(`/gamification/rewards/${id}/redeem`);
