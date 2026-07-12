import axiosClient from './axiosClient';

// Category APIs
export const getCategories = async () => {
  const res = await axiosClient.get('/social/categories');
  return res.data.categories;
};

export const getCategoryById = async (id) => {
  const res = await axiosClient.get(`/social/categories/${id}`);
  return res.data.category;
};

export const createCategory = async (data) => {
  const res = await axiosClient.post('/social/categories', data);
  return res.data.category;
};

export const updateCategory = async (id, data) => {
  const res = await axiosClient.put(`/social/categories/${id}`, data);
  return res.data.category;
};

export const deleteCategory = async (id) => {
  const res = await axiosClient.delete(`/social/categories/${id}`);
  return res.data;
};

// CSR Activity APIs
export const getActivities = async (params) => {
  const res = await axiosClient.get('/social/csr-activities', { params });
  return res.data.activities;
};

export const getActivityById = async (id) => {
  const res = await axiosClient.get(`/social/csr-activities/${id}`);
  return res.data.activity;
};

export const createActivity = async (data) => {
  const res = await axiosClient.post('/social/csr-activities', data);
  return res.data.activity;
};

export const updateActivity = async (id, data) => {
  const res = await axiosClient.put(`/social/csr-activities/${id}`, data);
  return res.data.activity;
};

export const deleteActivity = async (id) => {
  const res = await axiosClient.delete(`/social/csr-activities/${id}`);
  return res.data;
};

export const publishActivity = async (id) => {
  const res = await axiosClient.patch(`/social/csr-activities/${id}/publish`);
  return res.data.activity;
};

// Participation APIs
export const joinActivity = async (data) => {
  const res = await axiosClient.post('/social/participations/join', data);
  return res.data.participation;
};

export const uploadProof = async (data) => {
  const res = await axiosClient.post('/social/participations/upload-proof', data);
  return res.data.participation;
};

export const approveParticipation = async (id, data) => {
  const res = await axiosClient.patch(`/social/participations/${id}/approve`, data);
  return res.data.participation;
};

export const rejectParticipation = async (id, data) => {
  const res = await axiosClient.patch(`/social/participations/${id}/reject`, data);
  return res.data.participation;
};

export const getMyParticipations = async () => {
  const res = await axiosClient.get('/social/participations/my');
  return res.data.participations;
};

export const getPendingParticipations = async () => {
  const res = await axiosClient.get('/social/participations/pending');
  return res.data.participations;
};

export const getActivityParticipants = async (activityId) => {
  const res = await axiosClient.get(`/social/participations/activity/${activityId}`);
  return res.data.participations;
};
