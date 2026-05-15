import axiosClient from './axiosClient';

export const loginApi = (data) => axiosClient.post('/auth/login', data);
export const registerApi = (data) => axiosClient.post('/auth/register', data);
export const getMeApi = () => axiosClient.get('/auth/me');
export const createRescueAccountApi = (data) => axiosClient.post('/auth/admin/rescue-accounts', data);
