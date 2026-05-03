import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';
import { tokenManager } from '../utils/tokenManager';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'TEACHER' | 'STUDENT';
  teacher?: {
    schoolName?: string;
    designation?: string;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithSocial: (provider: 'google' | 'facebook', token: string, role?: 'TEACHER' | 'STUDENT') => Promise<void>;
  register: (payload: any) => Promise<void>;
  updateProfile: (payload: any) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', { email, password });
          tokenManager.setToken(response.data.token);
          set({ user: response.data.user, token: response.data.token, isLoading: false });
        } catch (err: any) {
          set({ error: err.response?.data?.error || 'Login failed', isLoading: false });
          throw err;
        }
      },
      loginWithSocial: async (provider, token, role) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/social', { provider, token, role: role || 'STUDENT' });
          tokenManager.setToken(response.data.token);
          set({ user: response.data.user, token: response.data.token, isLoading: false });
        } catch (err: any) {
          set({ error: err.response?.data?.error || `${provider} login failed`, isLoading: false });
          throw err;
        }
      },
      register: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/register', payload);
          tokenManager.setToken(response.data.token);
          set({ user: response.data.user, token: response.data.token, isLoading: false });
        } catch (err: any) {
          set({ error: err.response?.data?.error || 'Registration failed', isLoading: false });
          throw err;
        }
      },
      updateProfile: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.put('/auth/profile', payload);
          set({ user: response.data.user, isLoading: false });
          return true;
        } catch (err: any) {
          set({ error: err.response?.data?.error || 'Update failed', isLoading: false });
          return false;
        }
      },
      logout: () => {
        tokenManager.setToken(null);
        set({ user: null, token: null, error: null });
      },
    }),
    {
      name: 'attendance-pro-auth',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          tokenManager.setToken(state.token);
        }
      },
    }
  )
);
