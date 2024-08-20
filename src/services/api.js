import axios from 'axios';
import rateLimit from 'axios-rate-limit';
import { encrypt, decrypt } from './encryption';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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
    if (error.response) {
      switch (error.response.status) {
        case 401:
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          toast.error('Session expired. Please log in again.');
          break;
        case 403:
          toast.error('You do not have permission to perform this action.');
          break;
        case 404:
          toast.error('The requested resource was not found.');
          break;
        case 500:
          toast.error('An unexpected error occurred. Please try again later.');
          break;
        default:
          toast.error(error.response.data.message || 'An error occurred.');
      }
    } else if (error.request) {
      toast.error('Unable to connect to the server. Please check your internet connection.');
    } else {
      toast.error('An unexpected error occurred. Please try again.');
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
  getTasks: () => api.get('/tasks').then(response => ({
    ...response,
    data: response.data.map(task => ({
      ...task,
      title: decrypt(task.title)
    }))
  })),
  createTask: (task) => api.post('/tasks', { ...task, title: encrypt(task.title) }),
  updateTask: (id, task) => api.put(`/tasks/${id}`, { ...task, title: encrypt(task.title) }),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

export const profileService = {
  getProfile: () => api.get('/profile'),
  updateProfile: (profile) => api.put('/profile', profile),
};

export const aiService = {
  getRecommendations: () => api.get('/ai/recommendations').then(response => ({
    ...response,
    data: response.data.map(recommendation => ({
      ...recommendation,
      title: decrypt(recommendation.title),
      description: decrypt(recommendation.description)
    }))
  })),
  submitFeedback: (feedback) => api.post('/ai/feedback', feedback),
};

export const neo4jService = {
  runQuery: (query, params) => api.post('/neo4j/query', { query, params }),
};

export default api;