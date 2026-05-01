import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  permissions: Record<string, Record<string, boolean>>;
  setAuth: (user: User, token: string) => void;
  setPermissions: (matrix: Record<string, Record<string, boolean>>) => void;
  canAccess: (menu: string) => boolean;
  canWrite: (menu: string) => boolean;
  isAdmin: () => boolean;
  isEditor: () => boolean;
  isAuthor: () => boolean;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      permissions: {},

      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true });
      },

      setPermissions: (matrix) => {
        set({ permissions: matrix });
      },

      canAccess: (menu) => {
        const { user, permissions } = get();
        if (!user) return false;
        if (user.role === 'admin') return true;
        return !!(permissions[menu] && permissions[menu][user.role]);
      },

      canWrite: (menu) => {
        const { user, canAccess } = get();
        if (!user) return false;
        if (user.role === 'admin') return true;
        if (!canAccess(menu)) return false;
        if (user.role === 'editor') return true;
        if (user.role === 'author') {
          return ['posts', 'pengumumans', 'agendas', 'videos', 'media'].includes(menu);
        }
        return false;
      },

      isAdmin: () => get().user?.role === 'admin',
      isEditor: () => get().user?.role === 'editor',
      isAuthor: () => get().user?.role === 'author',
      
      setUser: (user) => {
        set({ user });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, permissions: {} });
      },
    }),
    {
      name: 'auth-storage', // key in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
