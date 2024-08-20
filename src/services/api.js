import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
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
  getInsights: () => api.get('/ai/insights'),
};

export const analyticsService = {
  getUserAnalytics: () => api.get('/analytics/user'),
  getSystemAnalytics: () => api.get('/analytics/system'),
};

export default api;