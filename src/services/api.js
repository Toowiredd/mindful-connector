import axios from 'axios';
import rateLimit from 'axios-rate-limit';
import { encrypt, decrypt } from './encryption';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.adhd2e.com';
const NEO4J_URI = import.meta.env.VITE_NEO4J_URI || 'bolt://localhost:7687';

const api = rateLimit(axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
}), { maxRequests: 100, perMilliseconds: 60000 });

// ... (rest of the existing code)

export const neo4jService = {
  runQuery: (query, params) => api.post('/neo4j/query', { query, params }),
};

export default api;