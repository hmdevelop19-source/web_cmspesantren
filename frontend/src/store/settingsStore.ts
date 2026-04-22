import { create } from 'zustand';
import api from '../lib/api';

interface SettingsState {
  settings: any;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  isLoading: false,
  fetchSettings: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/public/settings');
      set({ settings: response.data, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch public settings', error);
      set({ isLoading: false });
    }
  },
}));
