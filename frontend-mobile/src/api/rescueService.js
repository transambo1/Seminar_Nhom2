import apiClient from './apiClient';

export const rescueService = {
  // 1. Lấy danh sách yêu cầu đang chờ (Khớp: @GetMapping("/status/{status}"))
  getPendingRequests: () => 
    apiClient.get('/api/v1/support-requests/status/PENDING'),

  // 2. Phân công nhiệm vụ (Khớp: @PatchMapping("/{id}/assign") nhận SupportAssignRequest)
  // Lưu ý: Key phải là assignedTeamId theo đúng SupportAssignRequest.java
  assignTask: (requestId, teamId) =>
    apiClient.patch(`/api/v1/support-requests/${requestId}/assign`, { 
      assignedTeamId: teamId 
    }),

  // 3. Tự động phân công (Khớp: @PostMapping("/{id}/auto-assign"))
  autoAssign: (requestId) =>
    apiClient.post(`/api/v1/support-requests/${requestId}/auto-assign`),

  // 4. Cập nhật trạng thái (Khớp: @PatchMapping("/{id}/status") nhận SupportStatusUpdateRequest)
  updateStatus: (requestId, status) =>
    apiClient.patch(`/api/v1/support-requests/${requestId}/status`, { status }),

  // 5. Lấy nhiệm vụ CỦA TÔI (SỬA LỖI 404: Khớp @GetMapping("/my"))
  // BE dùng @RequestHeader X-User-Id, nên truyền ID vào header nếu cần
  getMyMissions: (userId) =>
    apiClient.get('/api/v1/support-requests/my', {
      headers: { 'X-User-Id': userId } // Truyền ID vào Header như Backend yêu cầu
    }),

  // THÊM HÀM NÀY (Nếu muốn lấy theo Team): Vì Backend có @GetMapping("/team/{teamId}")
  getMissionsByTeam: (teamId) =>
    apiClient.get(`/api/v1/support-requests/team/${teamId}`),
  // 7. Lấy thông tin đội theo Leader ID (SỬA LỖI 404: Khớp @GetMapping("/leader/{leaderId}"))
  getTeamByLeader: (leaderId) => 
    apiClient.get(`/api/v1/rescue-teams/leader/${leaderId}`)
};