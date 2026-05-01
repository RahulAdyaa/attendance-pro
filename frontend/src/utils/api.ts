import axios from 'axios';
import Constants from 'expo-constants';
import { tokenManager } from './tokenManager';

import { Platform } from 'react-native';

let API_BASE_URL = 'https://backend-theta-two-72.vercel.app/api';

console.log('Using API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const token = tokenManager.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
