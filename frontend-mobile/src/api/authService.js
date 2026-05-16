import apiClient from './apiClient';
import * as SecureStore from 'expo-secure-store';

const AUTH_URL = '/api/v1/auth';

export const authService = {
  // Đăng nhập
  login: async (email, password) => {
    try {
      const response = await apiClient.post(`${AUTH_URL}/login`, { email, password });
      const { token, ...userProfile } = response.data;

      // Lưu Token và Profile vào SecureStore
      if (token) {
        await SecureStore.setItemAsync('userToken', token);
        await SecureStore.setItemAsync('userProfile', JSON.stringify(userProfile));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Authentication failed';
    }
  },

  // Đăng xuất
  logout: async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userProfile');
  },

  // Lấy thông tin User đã lưu
  getCurrentUser: async () => {
    const profile = await SecureStore.getItemAsync('userProfile');
    return profile ? JSON.parse(profile) : null;
  }
};