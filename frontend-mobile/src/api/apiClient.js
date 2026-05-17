import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Thay đổi IP này thành IP máy tính của bạn nếu dùng máy thật
// 10.0.2.2 là địa chỉ mặc định để Android Emulator truy cập localhost
const BASE_URL = 'http://192.168.11.31:8080'; 

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Tự động gắn Token vào Header
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;