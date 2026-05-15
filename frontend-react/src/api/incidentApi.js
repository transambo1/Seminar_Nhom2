import axiosClient from './axiosClient';

export const createIncidentReportApi = (data) => axiosClient.post('/incident-reports', data);
export const getAllIncidentReportsApi = () => axiosClient.get('/incident-reports');
export const getPendingIncidentReportsApi = () => axiosClient.get('/incident-reports/pending');
export const getIncidentReportByIdApi = (id) => axiosClient.get(`/incident-reports/${id}`);
export const reviewIncidentReportApi = (id, data) => axiosClient.put(`/incident-reports/${id}/review`, data);
