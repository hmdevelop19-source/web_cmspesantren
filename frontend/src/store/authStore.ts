import { create } from 'zustand';
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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('auth_token'),
  isAuthenticated: !!localStorage.getItem('auth_token'),
  permissions: JSON.parse(localStorage.getItem('permissions') || '{}'),

  setAuth: (user, token) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  setPermissions: (matrix) => {
    localStorage.setItem('permissions', JSON.stringify(matrix));
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
    // Check if they can even access the menu
    if (!canAccess(menu)) return false;
    // Editors can write to content modules
    if (user.role === 'editor') return true;
    // Authors can write to specific content modules
    if (user.role === 'author') {
      return ['posts', 'pengumumans', 'agendas', 'videos', 'media'].includes(menu);
    }
    return false;
  },

  isAdmin: () => get().user?.role === 'admin',
  isEditor: () => get().user?.role === 'editor',
  isAuthor: () => get().user?.role === 'author',
  
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    set({ user: null, token: null, isAuthenticated: false, permissions: {} });
  },
}));
