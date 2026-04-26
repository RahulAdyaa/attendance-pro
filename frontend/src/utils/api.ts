import axios from 'axios';
import { Platform } from 'react-native';
import { tokenManager } from './tokenManager';

// Use your machine's LAN IP so the app works on physical devices & emulators.
// Android emulator uses 10.0.2.2 to reach host localhost.
// Render cloud backend URL
const API_BASE_URL = 'https://attendance-pro-i6w9.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = tokenManager.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
