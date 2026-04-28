import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';

interface DataState {
  classes: any[];
  stats: any | null;
  lastUpdated: number | null;
  setClasses: (classes: any[]) => void;
  setStats: (stats: any) => void;
  fetchClasses: () => Promise<void>;
  fetchStats: (dateString: string) => Promise<void>;
  createClass: (data: { name: string; subject: string; section?: string }) => Promise<boolean>;
  updateClass: (id: string, data: { name?: string; subject?: string; section?: string }) => Promise<boolean>;
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      classes: [],
      stats: null,
      lastUpdated: null,
      setClasses: (classes) => set({ classes, lastUpdated: Date.now() }),
      setStats: (stats) => set({ stats, lastUpdated: Date.now() }),
      fetchClasses: async () => {
        try {
          const response = await api.get('/classes/teacher');
          const data = response.data.map((c: any) => ({ ...c, studentCount: c._count?.students || 0 }));
          set({ classes: data, lastUpdated: Date.now() });
        } catch (error) {
          console.error('Failed to fetch classes for cache:', error);
        }
      },
      fetchStats: async (dateString: string) => {
        try {
          const response = await api.get(`/classes/teacher/stats?date=${dateString}`);
          set({ stats: response.data, lastUpdated: Date.now() });
        } catch (error) {
          console.error('Failed to fetch stats for cache:', error);
        }
      },
      createClass: async (data) => {
        try {
          await api.post('/classes', data);
          await get().fetchClasses();
          return true;
        } catch (error) {
          console.error('Failed to create class:', error);
          return false;
        }
      },
      updateClass: async (id, data) => {
        try {
          await api.put(`/classes/${id}`, data);
          await get().fetchClasses();
          return true;
        } catch (error) {
          console.error('Failed to update class:', error);
          return false;
        }
      },
    }),
    {
      name: 'attendance-pro-data',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
