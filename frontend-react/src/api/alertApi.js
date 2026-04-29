import axiosClient from './axiosClient';

export const getActiveAlertsApi = () => axiosClient.get('/alerts/active');
