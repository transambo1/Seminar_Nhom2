import axiosClient from './axiosClient';

export const getMyNotificationsApi = (userId) => axiosClient.get(`/notifications/my?userId=${userId}`);
export const getUnreadCountApi = (userId) => axiosClient.get(`/notifications/unread-count?userId=${userId}`);
export const markNotificationReadApi = (id) => axiosClient.patch(`/notifications/${id}/read`);
export const markAllNotificationsReadApi = (userId) => axiosClient.patch(`/notifications/read-all?userId=${userId}`);
