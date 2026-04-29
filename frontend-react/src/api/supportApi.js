import axiosClient from './axiosClient';

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

    cleanParams[key] = value;
  });

  return axiosClient.get('/support-requests/filter', {
    params: cleanParams,
    headers: userId ? { 'X-User-Id': userId } : {}
  });
};

export const updateSupportStatusApi = (id, status) =>
  axiosClient.patch(`/support-requests/${id}/status`, { status });
