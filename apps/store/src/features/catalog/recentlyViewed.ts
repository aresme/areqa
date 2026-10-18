import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX = 12;

interface RecentState {
  ids: string[];
  push: (productId: string) => void;
}

export const useRecentlyViewed = create<RecentState>()(
  persist(
    (set, get) => ({
      ids: [],
      push: (id) => set({ ids: [id, ...get().ids.filter((x) => x !== id)].slice(0, MAX) }),
    }),
    { name: 'areqa-recent', version: 1 },
  ),
);
