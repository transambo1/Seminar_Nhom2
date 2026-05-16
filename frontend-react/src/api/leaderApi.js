import axiosClient from './axiosClient';

/**
 * Lấy thông tin đội cứu hộ của leader hiện tại
 * @param {number} leaderId 
 */
export const getTeamByLeaderIdApi = (leaderId) => axiosClient.get(`/rescue-teams/leader/${leaderId}`);

/**
 * Lấy danh sách thành viên của đội
 * @param {number} teamId 
 */
export const getTeamMembersApi = (teamId) => axiosClient.get(`/rescue-teams/${teamId}/members`);

/**
 * Thêm thành viên mới vào đội
 * @param {number} teamId 
 * @param {object} data 
 */
export const addTeamMemberApi = (teamId, data) => axiosClient.post(`/rescue-teams/${teamId}/members`, data);

/**
 * Lấy thông tin đội cứu hộ của leader hiện tại (dùng header)
 */
export const getMyTeamApi = () => axiosClient.get(`/rescue-teams/my-team`);

/**
 * Lấy danh sách yêu cầu cứu hộ đã gán cho đội
 * @param {number} teamId 
 */
export const getRequestsByTeamIdApi = (teamId) => axiosClient.get(`/support-requests/team/${teamId}`);

/**
 * Phân công yêu cầu cứu hộ cho thành viên cụ thể
 * @param {number} requestId 
 * @param {object} data { assignedTeamId, assignedRescueUserId }
 */
export const assignRequestToMemberApi = (requestId, data) => axiosClient.patch(`/support-requests/${requestId}/assign`, data);

/**
 * Lấy thông tin chi tiết của một user (để xem info member)
 * @param {number} userId 
 */
export const getUserDetailApi = (userId) => axiosClient.get(`/auth/users/${userId}`);

/**
 * Đội trưởng tạo tài khoản cho thành viên (RESCUE)
 * @param {object} data 
 */
export const createRescueMemberApi = (data) => axiosClient.post('/auth/leader/rescue-members', data);
