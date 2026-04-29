import axiosClient from './axiosClient';

export const getSheltersApi = () => axiosClient.get('/shelters');
export const getShelterByIdApi = (id) => axiosClient.get(`/shelters/${id}`);
