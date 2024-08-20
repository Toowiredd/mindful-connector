import axios from 'axios';
import rateLimit from 'axios-rate-limit';
import { encrypt, decrypt } from './encryption';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.adhd2e.com';

const api = rateLimit(axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
}), { maxRequests: 100, perMilliseconds: 60000 });

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    if (config.data && config.url !== '/auth/login') {
      config.data = encrypt(JSON.stringify(config.data));
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'string') {
      response.data = JSON.parse(decrypt(response.data));
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const { token } = response.data;
        localStorage.setItem('authToken', token);
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
};

export const taskService = {
  getTasks: () => api.get('/tasks'),
  createTask: (task) => api.post('/tasks', task),
  updateTask: (id, task) => api.put(`/tasks/${id}`, task),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

export const profileService = {
  getProfile: () => api.get('/profile'),
  updateProfile: (profile) => api.put('/profile', profile),
};

export const aiService = {
  getRecommendations: () => api.get('/ai/recommendations'),
  getPersonalizedRecommendations: () => api.get('/ai/personalized-recommendations'),
  getInsights: () => api.get('/ai/insights'),
  submitFeedback: (recommendationId, feedback) => api.post('/ai/feedback', { recommendationId, feedback }),
  getChatResponse: (message) => api.post('/ai/chat', { message }),
};

export const analyticsService = {
  getUserAnalytics: () => api.get('/analytics/user'),
  getSystemAnalytics: () => api.get('/analytics/system'),
};

export const feedbackService = {
  submitFeedback: (feedback) => api.post('/feedback', feedback),
};

export default api;