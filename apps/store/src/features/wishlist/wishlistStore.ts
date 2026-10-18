import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  ids: string[];
  toggle: (productId: string) => boolean;
  has: (productId: string) => boolean;
  replaceAll: (ids: string[]) => void;
}

/** Guest wishlist in localStorage; synced to users/{uid}.wishlist after sign-in (phase 4). */
export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle(productId) {
        const on = !get().ids.includes(productId);
        set({ ids: on ? [productId, ...get().ids] : get().ids.filter((id) => id !== productId) });
        return on;
      },
      has: (productId) => get().ids.includes(productId),
      replaceAll: (ids) => set({ ids: [...new Set(ids)] }),
    }),
    { name: 'areqa-wishlist', version: 1 },
  ),
);
