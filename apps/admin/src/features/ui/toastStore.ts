import { create } from 'zustand';

export type ToastTone = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
  action?: { label: string; href: string };
}

interface ToastState {
  toasts: Toast[];
  push: (t: Omit<Toast, 'id'>) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

export const useToasts = create<ToastState>()((set, get) => ({
  toasts: [],
  push(t) {
    const id = nextId++;
    set({ toasts: [...get().toasts.slice(-2), { ...t, id }] });
    setTimeout(() => get().dismiss(id), t.tone === 'error' ? 6000 : 3500);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

export const toast = {
  success: (title: string, extra?: Partial<Omit<Toast, 'id' | 'tone' | 'title'>>) =>
    useToasts.getState().push({ tone: 'success', title, ...extra }),
  error: (title: string, extra?: Partial<Omit<Toast, 'id' | 'tone' | 'title'>>) =>
    useToasts.getState().push({ tone: 'error', title, ...extra }),
  info: (title: string, extra?: Partial<Omit<Toast, 'id' | 'tone' | 'title'>>) =>
    useToasts.getState().push({ tone: 'info', title, ...extra }),
};
