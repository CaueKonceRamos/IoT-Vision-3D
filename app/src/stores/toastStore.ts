import { create } from 'zustand';
import type { Toast } from '@/types';

interface ToastState {
  toasts: Toast[];
  add: (toast: Omit<Toast, 'id'>) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  add: (toast) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    const duration = toast.duration || 4000;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id, duration }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, duration);
  },
  remove: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (message: string) => useToastStore.getState().add({ type: 'success', message }),
  error: (message: string) => useToastStore.getState().add({ type: 'error', message }),
  warning: (message: string) => useToastStore.getState().add({ type: 'warning', message }),
  info: (message: string) => useToastStore.getState().add({ type: 'info', message }),
};
