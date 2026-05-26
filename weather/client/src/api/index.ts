import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

let tokenSource = { current: null as string | null };

export function setAuthToken(token: string | null) {
  tokenSource.current = token;
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

export function getAuthToken(): string | null {
  return tokenSource.current || localStorage.getItem('token');
}

export function clearAuthToken() {
  tokenSource.current = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

interface ApiError extends Error {
  isNetworkError?: boolean;
  skipGlobalHandler?: boolean;
}

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token && !token.startsWith('mock_')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config as InternalAxiosRequestConfig;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code !== 0 && res.code !== undefined) {
      const err: ApiError = new Error(res.message || '请求失败');
      err.name = 'ApiError';
      if (!response.config.skipGlobalHandler) {
        message.error(res.message || '请求失败');
      }
      return Promise.reject(err);
    }
    return response;
  },
  (error: AxiosError) => {
    const err: ApiError = new Error();
    err.name = 'NetworkError';
    err.isNetworkError = true;

    if (error.response?.status === 401) {
      clearAuthToken();
      window.dispatchEvent(new CustomEvent('auth:logout'));
      if (!error.config?.skipGlobalHandler) {
        message.warning('登录已过期，请重新登录');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
      return Promise.reject(err);
    }

    if (!error.config?.skipGlobalHandler) {
      const errorMsg = (error.response?.data as any)?.message || '网络错误，请检查网络连接';
      message.error(errorMsg);
    }

    return Promise.reject(err);
  }
);

declare module 'axios' {
  interface AxiosRequestConfig {
    skipGlobalHandler?: boolean;
  }
}

export const authApi = {
  sendCode: (target: string, type: 'phone' | 'email') =>
    api.post('/auth/send-code', { target, type }, { skipGlobalHandler: true }),

  register: (phone: string, code: string, password: string) =>
    api.post('/auth/register', { phone, code, password }, { skipGlobalHandler: true }),

  login: (phone: string, password?: string, code?: string) =>
    api.post('/auth/login', { phone, password, code }, { skipGlobalHandler: true }),

  requestReset: (target: string, type: 'phone' | 'email') =>
    api.post('/auth/request-reset', { target, type }, { skipGlobalHandler: true }),

  resetPassword: (data: {
    target?: string;
    code?: string;
    token?: string;
    newPassword: string;
    type?: 'phone' | 'email';
  }) => api.post('/auth/reset-password', data, { skipGlobalHandler: true }),
};

export const userApi = {
  getProfile: () => api.get('/user/profile', { skipGlobalHandler: true }),
  updateProfile: (data: {
    nickname?: string;
    avatar?: string;
    birthday?: string;
    gender?: string;
  }) => api.put('/user/profile', data, { skipGlobalHandler: true }),
};

export const socialApi = {
  getAuthUrl: (provider: string) =>
    api.get(`/social/${provider}/url`),

  callback: (provider: string, code: string) =>
    api.get(`/social/${provider}/callback`, { params: { code } }, { skipGlobalHandler: true }),

  getAccounts: () => api.get('/social/accounts', { skipGlobalHandler: true }),

  bind: (provider: string, data: {
    providerId: string;
    nickname?: string;
    avatar?: string;
    accessToken?: string;
    refreshToken?: string;
  }) => api.post(`/social/${provider}/bind`, data, { skipGlobalHandler: true }),

  unbind: (provider: string) =>
    api.delete(`/social/${provider}/unbind`, { skipGlobalHandler: true }),
};

export default api;
