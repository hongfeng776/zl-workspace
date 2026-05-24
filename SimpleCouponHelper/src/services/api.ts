import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: (username: string, password: string, nickname: string) =>
    api.post('/auth/register', { username, password, nickname }),
  
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  
  getProfile: () => api.get('/auth/profile'),
  
  getUsers: () => api.get('/auth/users'),
};

export const roomApi = {
  getRooms: () => api.get('/rooms'),
  
  createRoom: (name: string) => api.post('/rooms', { name }),
  
  getRoom: (id: string) => api.get(`/rooms/${id}`),
  
  joinRoom: (id: string) => api.post(`/rooms/${id}/join`),
  
  leaveRoom: (id: string) => api.post(`/rooms/${id}/leave`),
  
  selectSong: (roomId: string, songId: string) =>
    api.post(`/rooms/${roomId}/select-song`, { songId }),
};

export const songApi = {
  getSongs: () => api.get('/songs'),
  
  getSong: (id: string) => api.get(`/songs/${id}`),
};

export const battleApi = {
  startBattle: (roomId: string, songId: string) =>
    api.post('/battles/start', { roomId, songId }),
  
  submitScore: (battleId: string, pitch: number, rhythm: number, energy: number, lyrics: number) =>
    api.post('/battles/score', { battleId, pitch, rhythm, energy, lyrics }),
  
  getBattle: (id: string) => api.get(`/battles/${id}`),
  
  getHistory: () => api.get('/battles/user/history'),
};

export const audioApi = {
  uploadAudio: (battleId: string, audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('battleId', battleId);
    formData.append('audio', audioBlob, 'recording.webm');
    return api.post('/audio/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  getMyAudios: () => api.get('/audio/my-audios'),
};

export default api;
