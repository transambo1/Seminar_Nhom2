import axiosClient from './axiosClient';

// Auth
export const loginApi = (data) => axiosClient.post('/auth/login', data);
export const registerApi = (data) => axiosClient.post('/auth/register', data);
export const getMeApi = () => axiosClient.get('/auth/me');

// Shelters
export const getSheltersApi = () => axiosClient.get('/shelters');
export const getShelterByIdApi = (id) => axiosClient.get(`/shelters/${id}`);

// Alerts
export const getActiveAlertsApi = () => axiosClient.get('/alerts/active');

// Reports
export const submitReportApi = (data) => axiosClient.post('/reports', data);
export const getApprovedReportsApi = () => axiosClient.get('/reports/approved');
export const getPendingReportsApi = () => axiosClient.get('/reports/pending');
export const approveReportApi = (id, adminId) => axiosClient.patch(`/reports/${id}/approve`, { adminId });
export const rejectReportApi = (id, adminId) => axiosClient.patch(`/reports/${id}/reject`, { adminId });

// Support Requests
export const createSupportApi = (data) => axiosClient.post('/support-requests', data);
export const getMySupportsApi = () => axiosClient.get('/support-requests/my');
export const getAllSupportsApi = () => axiosClient.get('/support-requests');
export const updateSupportStatusApi = (id, status) => axiosClient.patch(`/support-requests/${id}/status`, { status });

// Notifications
export const getMyNotificationsApi = () => axiosClient.get('/notifications/my');
export const markNotificationReadApi = (id) => axiosClient.patch(`/notifications/${id}/read`);
