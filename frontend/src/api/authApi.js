import client from './axiosClient';

export const getMe = () => client.get('/auth/me');
