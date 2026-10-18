import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MAX_ORDER_LINES, MAX_QTY_PER_LINE, type CartLine } from '@areqa/shared';

/** Display snapshot taken when the item is added. Checkout always re-reads live prices. */
export type CartItem = CartLine;

export type AddResult = 'added' | 'updated' | 'line-limit' | 'qty-limit';

interface CartState {
  items: CartItem[];
  add: (item: Omit<CartItem, 'qty'>, qty?: number, maxStock?: number) => AddResult;
  setQty: (productId: string, variantKey: string, qty: number) => void;
  remove: (productId: string, variantKey: string) => void;
  clear: () => void;
  replaceAll: (items: CartItem[]) => void;
}

const same = (
  a: Pick<CartItem, 'productId' | 'variantKey'>,
  productId: string,
  variantKey: string,
) => a.productId === productId && a.variantKey === variantKey;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add(item, qty = 1, maxStock = MAX_QTY_PER_LINE) {
        const cap = Math.min(MAX_QTY_PER_LINE, maxStock);
        const existing = get().items.find((i) => same(i, item.productId, item.variantKey));
        if (existing) {
          const next = Math.min(cap, existing.qty + qty);
          if (next === existing.qty) return 'qty-limit';
          set({
            items: get().items.map((i) =>
              same(i, item.productId, item.variantKey) ? { ...i, ...item, qty: next } : i,
            ),
          });
          return 'updated';
        }
        if (get().items.length >= MAX_ORDER_LINES) return 'line-limit';
        set({ items: [...get().items, { ...item, qty: Math.min(cap, qty) }] });
        return 'added';
      },
      setQty(productId, variantKey, qty) {
        const q = Math.max(1, Math.min(MAX_QTY_PER_LINE, qty));
        set({
          items: get().items.map((i) => (same(i, productId, variantKey) ? { ...i, qty: q } : i)),
        });
      },
      remove(productId, variantKey) {
        set({ items: get().items.filter((i) => !same(i, productId, variantKey)) });
      },
      clear: () => set({ items: [] }),
      replaceAll: (items) => set({ items: items.slice(0, MAX_ORDER_LINES) }),
    }),
    { name: 'areqa-cart', version: 1, storage: createJSONStorage(() => localStorage) },
  ),
);

export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.qty, 0);
export const cartSubtotal = (items: CartItem[]) => items.reduce((n, i) => n + i.qty * i.price, 0);
