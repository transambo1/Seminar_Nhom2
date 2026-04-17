import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' }
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) { config.headers.Authorization = `Bearer ${token}`; }
  // Temporary fix for MVP decoupled microservices
  const userStr = localStorage.getItem('user');
  if (userStr) {
      const user = JSON.parse(userStr);
      config.headers['X-User-Id'] = user.id;
  }
  return config;
});

export default axiosClient;
