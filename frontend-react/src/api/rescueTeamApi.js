import axiosClient from './axiosClient';

export const getRescueTeamsApi = () => {
    return axiosClient.get('/rescue-teams');
};

export const createRescueTeamApi = (data) => {
    return axiosClient.post('/rescue-teams', data);
};

export const getRescueTeamMembersApi = (teamId) => {
    return axiosClient.get(`/rescue-teams/${teamId}/members`);
};

export const addRescueTeamMemberApi = (teamId, data) => {
    return axiosClient.post(`/rescue-teams/${teamId}/members`, data);
};
