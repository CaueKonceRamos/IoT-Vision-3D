import { create } from 'zustand';
import type { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: async (email: string, _password: string) => {
    // Simulação de login
    const mockUser: User = {
      id: '1',
      name: email.split('@')[0] || 'Usuario',
      email,
      role: 'aluno',
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
    };
    set({ user: mockUser, isAuthenticated: true });
    return true;
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));
