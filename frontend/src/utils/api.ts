import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// For physical devices, use your local IP instead of localhost
// Example: 'http://192.168.1.100:5000/api'
const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
