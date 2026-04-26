import axios from 'axios';
import { Platform } from 'react-native';
import { tokenManager } from './tokenManager';

// Use your machine's LAN IP so the app works on physical devices & emulators.
// Android emulator uses 10.0.2.2 to reach host localhost.
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    // Android emulator special IP
    return 'http://10.0.2.2:5001/api';
  }
  // iOS simulator can use localhost, physical devices need LAN IP
  return 'http://192.168.0.2:5001/api';
};

const API_BASE_URL = getBaseUrl();

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
