import axios from 'axios';
import { message } from 'antd';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code !== 0 && res.code !== undefined) {
      message.error(res.message || '请求失败');
      return Promise.reject(new Error(res.message || '请求失败'));
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else {
      message.error(error.response?.data?.message || '网络错误');
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  sendCode: (target: string, type: 'phone' | 'email') =>
    api.post('/auth/send-code', { target, type }),

  register: (phone: string, code: string, password: string) =>
    api.post('/auth/register', { phone, code, password }),

  login: (phone: string, password?: string, code?: string) =>
    api.post('/auth/login', { phone, password, code }),

  requestReset: (target: string, type: 'phone' | 'email') =>
    api.post('/auth/request-reset', { target, type }),

  resetPassword: (data: {
    target?: string;
    code?: string;
    token?: string;
    newPassword: string;
    type?: 'phone' | 'email';
  }) => api.post('/auth/reset-password', data),
};

export const userApi = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: {
    nickname?: string;
    avatar?: string;
    birthday?: string;
    gender?: string;
  }) => api.put('/user/profile', data),
};

export const socialApi = {
  getAuthUrl: (provider: string) =>
    api.get(`/social/${provider}/url`),

  callback: (provider: string, code: string) =>
    api.get(`/social/${provider}/callback`, { params: { code } }),

  getAccounts: () => api.get('/social/accounts'),

  bind: (provider: string, data: {
    providerId: string;
    nickname?: string;
    avatar?: string;
    accessToken?: string;
    refreshToken?: string;
  }) => api.post(`/social/${provider}/bind`, data),

  unbind: (provider: string) =>
    api.delete(`/social/${provider}/unbind`),
};

export default api;
