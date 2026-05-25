import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const request: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 [Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ [Request Error]', error);
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data;
    console.log(`📥 [Response] ${response.config.url}`, res);
    
    if (res.code !== 200) {
      console.warn('⚠️ [API Error]', res.message);
      return Promise.reject({ message: res.message || '请求失败', code: res.code });
    }
    return res;
  },
  (error) => {
    console.error('❌ [Response Error]', error);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
      return Promise.reject({ message: '登录已过期，请重新登录', code: 401 });
    }
    
    if (error.response?.data) {
      return Promise.reject(error.response.data);
    }
    
    return Promise.reject({ message: error.message || '网络错误', code: 500 });
  }
);

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

export default request;
