import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  sendCode: (phone, type) => api.post('/auth/send-code', { phone, type }),
  register: (data) => api.post('/auth/register', data),
  login: (phone, password) => api.post('/auth/login', { phone, password }),
  loginCode: (phone, code) => api.post('/auth/login-code', { phone, code }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  thirdPartyLogin: (data) => api.post('/auth/third-party', data),
  getUserInfo: () => api.get('/auth/user-info'),
}

export const userApi = {
  deleteAccount: (code) => api.post('/user/delete-account', { code }),
  securityVerify: (questions) => api.post('/user/security-verify', { questions }),
  securityCheck: (answers) => api.post('/user/security-check', { answers }),
  getSecurityQuestions: () => api.get('/user/security-questions'),
  changePassword: (oldPassword, newPassword) => api.post('/user/change-password', { oldPassword, newPassword }),
  updateProfile: (data) => api.put('/user/profile', data),
}

export default api
