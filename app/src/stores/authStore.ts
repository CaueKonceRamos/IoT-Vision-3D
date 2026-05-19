import { create } from 'zustand';
import type { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  updateProfile: (name: string, avatarUrl?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: async (email: string, _password: string) => {
    // Simulação de login
    const username = email.split('@')[0] || 'Usuario';
    const mockUser: User = {
      id: '1',
      name: username,
      email,
      role: 'aluno',
      avatarUrl: `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(username)}`,
    };
    set({ user: mockUser, isAuthenticated: true });
    return true;
  },

  register: async (name: string, email: string, _password: string, role: UserRole) => {
    const mockUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role,
      avatarUrl: `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(name)}`,
    };
    set({ user: mockUser, isAuthenticated: true });
    return true;
  },

  updateProfile: (name: string, avatarUrl?: string) => {
    set((state) => ({
      user: state.user ? { ...state.user, name, avatarUrl: avatarUrl ?? state.user.avatarUrl } : null,
    }));
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));
