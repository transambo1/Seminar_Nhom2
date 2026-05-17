import apiClient from './apiClient';
import * as SecureStore from 'expo-secure-store';

const AUTH_URL = '/api/v1/auth';

export const authService = {
  // Đăng nhập
  login: async (email, password) => {
    try {
      const response = await apiClient.post(`${AUTH_URL}/login`, { email, password });
      
      // Chú ý: Không dùng dấu : để khai báo kiểu ở đây
      const { token, role, ...userProfile } = response.data;

      if (token) {
        await SecureStore.setItemAsync('userToken', token);
        // Lưu Role vào SecureStore để Layout check [cite: 174, 179]
        await SecureStore.setItemAsync('userRole', role || 'ROLE_CITIZEN'); 
        await SecureStore.setItemAsync('userProfile', JSON.stringify(userProfile));
        await SecureStore.setItemAsync('userId', userProfile.userId.toString());
      }
      return response.data;
    } catch (error) {
      // Trả về message lỗi từ backend [cite: 100]
      throw error.response?.data?.message || 'Authentication failed';
    }
  },

  // Đăng xuất
  logout: async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userRole');
    await SecureStore.deleteItemAsync('userProfile');
    await SecureStore.deleteItemAsync('userId');
  },

  // Lấy Role để check điều hướng [cite: 174]
  getUserRole: async () => {
    return await SecureStore.getItemAsync('userRole');
  }
};