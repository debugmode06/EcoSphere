import client from './axiosClient';

export const getActivities = () => client.get('/social/csr-activities');
export const createActivity = (data) => client.post('/social/csr-activities', data);
export const getParticipations = (params) => client.get('/social/participations', { params });
export const joinActivity = (data) => client.post('/social/participations', data);
export const approveParticipation = (id, data) => client.patch(`/social/participations/${id}/approve`, data);
