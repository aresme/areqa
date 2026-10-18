import { useMemo } from 'react';
import { useCatalogMap } from '@/features/catalog/hooks';
import { useCart, type CartItem } from './cartStore';

/**
 * Cart lines with prices refreshed from the catalog index, so a price change made in the
 * admin shows up before checkout (the transaction always uses the live product price).
 */
export function useLiveCart(): {
  items: CartItem[];
  subtotal: number;
  count: number;
  unavailable: CartItem[];
} {
  const items = useCart((s) => s.items);
  const catalog = useCatalogMap();
  return useMemo(() => {
    const live = items.map((i) => {
      const entry = catalog.get(i.productId);
      return entry ? { ...i, price: entry.price } : i;
    });
    const unavailable = catalog.size > 0 ? live.filter((i) => !catalog.has(i.productId)) : [];
    const subtotal = live.reduce((n, i) => n + i.price * i.qty, 0);
    const count = live.reduce((n, i) => n + i.qty, 0);
    return { items: live, subtotal, count, unavailable };
  }, [items, catalog]);
}
