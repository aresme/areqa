import { create } from 'zustand';

type Panel = 'search' | 'menu' | 'cart' | null;

interface UiState {
  panel: Panel;
  open: (panel: Exclude<Panel, null>) => void;
  close: () => void;
}

/** Only one overlay (search, mobile menu, cart drawer) is open at a time. */
export const useUi = create<UiState>()((set) => ({
  panel: null,
  open: (panel) => set({ panel }),
  close: () => set({ panel: null }),
}));
