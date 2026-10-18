import { create } from 'zustand';
import type { UserProfile } from '@areqa/shared';

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  providers: string[];
}

interface AuthState {
  status: 'loading' | 'guest' | 'user';
  user: AuthUser | null;
  profile: UserProfile | null;
  set: (s: Partial<Omit<AuthState, 'set'>>) => void;
}

export const useAuth = create<AuthState>()((set) => ({
  status: 'loading',
  user: null,
  profile: null,
  set: (s) => set(s),
}));
