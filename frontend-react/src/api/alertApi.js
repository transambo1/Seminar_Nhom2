import axiosClient from './axiosClient';

export const getActiveAlertsApi = () => axiosClient.get('/alerts/active');
export const createAlertApi = (data) => axiosClient.post('/alerts', data);
