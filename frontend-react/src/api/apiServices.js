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

// Support Requests
export const createSupportApi = (data) => axiosClient.post('/support-requests', data);

export const getMySupportsApi = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id || user.userId;

  return axiosClient.get('/support-requests/my', {
    headers: userId ? { 'X-User-Id': userId } : {}
  });
};

export const getAllSupportsApi = () => axiosClient.get('/support-requests');

export const getSupportFilterApi = (params = {}) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id || user.userId;

  const cleanParams = {};

  Object.keys(params).forEach((key) => {
    const value = params[key];

    if (value === undefined || value === null || value === '') {
      return;
    }

    // Keep scope=ALL because backend needs it explicitly
    cleanParams[key] = value;
  });

  return axiosClient.get('/support-requests/filter', {
    params: cleanParams,
    headers: userId ? { 'X-User-Id': userId } : {}
  });
};

export const updateSupportStatusApi = (id, status) =>
  axiosClient.patch(`/support-requests/${id}/status`, { status });

// Notifications
export const getMyNotificationsApi = (userId) => axiosClient.get(`/notifications/my?userId=${userId}`);
export const getUnreadCountApi = (userId) => axiosClient.get(`/notifications/unread-count?userId=${userId}`);
export const markNotificationReadApi = (id) => axiosClient.patch(`/notifications/${id}/read`);
export const markAllNotificationsReadApi = (userId) => axiosClient.patch(`/notifications/read-all?userId=${userId}`);