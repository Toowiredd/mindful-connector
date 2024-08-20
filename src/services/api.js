import axios from 'axios';
import rateLimit from 'axios-rate-limit';
import { encrypt, decrypt } from './encryption';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.adhd2e.com';

const api = rateLimit(axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
}), { maxRequests: 100, perMilliseconds: 60000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Handle token refresh or logout
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => {
    localStorage.removeItem('authToken');
    return api.post('/auth/logout');
  },
};

export const taskService = {
  getTasks: () => api.get('/tasks'),
  createTask: (task) => api.post('/tasks', { ...task, title: encrypt(task.title) }),
  updateTask: (id, task) => api.put(`/tasks/${id}`, { ...task, title: encrypt(task.title) }),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

export const profileService = {
  getProfile: () => api.get('/profile'),
  updateProfile: (profile) => api.put('/profile', profile),
};

export const aiService = {
  getRecommendations: () => api.get('/ai/recommendations'),
  submitFeedback: (feedback) => api.post('/ai/feedback', feedback),
};

export default api;