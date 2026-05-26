import axios, { AxiosInstance } from 'axios';
import { ElMessage } from 'element-plus';

const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const url = error.config?.url || '';
    const isLogoutRequest = url.includes('/auth/logout');

    if (error.response) {
      const message = error.response.data?.message || '请求失败';
      
      if (!isLogoutRequest) {
        ElMessage.error(message);
      }
      
      if (error.response.status === 401 && !isLogoutRequest) {
        localStorage.removeItem('token');
      }
    } else {
      if (!isLogoutRequest) {
        ElMessage.error('网络错误，请稍后重试');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
