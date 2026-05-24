import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
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
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProgress: (data) => api.put('/auth/progress', data)
};

export const englishAPI = {
  getVocabulary: (params) => api.get('/english/vocabulary', { params }),
  getDictationWords: (params) => api.get('/english/dictation', { params }),
  getGrammarLessons: (params) => api.get('/english/grammar', { params }),
  getGrammarQuestions: (lessonId) => api.get(`/english/grammar/${lessonId}`),
  getSpeakingTopics: (params) => api.get('/english/speaking', { params }),
  getSpeakingTopic: (topicId) => api.get(`/english/speaking/${topicId}`)
};

export default api;
