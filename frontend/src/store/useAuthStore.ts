import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'TEACHER' | 'STUDENT';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
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
          set({ user: response.data.user, token: response.data.token, isLoading: false });
        } catch (err: any) {
          set({ error: err.response?.data?.error || 'Login failed', isLoading: false });
          throw err;
        }
      },
      register: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/register', payload);
          set({ user: response.data.user, token: response.data.token, isLoading: false });
        } catch (err: any) {
          set({ error: err.response?.data?.error || 'Registration failed', isLoading: false });
          throw err;
        }
      },
      logout: () => set({ user: null, token: null, error: null }),
    }),
    {
      name: 'attendance-pro-auth',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
