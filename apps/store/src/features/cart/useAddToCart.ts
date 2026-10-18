import { useCallback } from 'react';
import { MAX_ORDER_LINES } from '@areqa/shared';
import { toast } from '@/features/ui/toastStore';
import { useUi } from '@/features/ui/uiStore';
import { useCart, type CartItem } from './cartStore';

/** Adds to cart with consistent feedback; opens the drawer on desktop-sized screens. */
export function useAddToCart() {
  const add = useCart((s) => s.add);
  const open = useUi((s) => s.open);
  return useCallback(
    (item: Omit<CartItem, 'qty'>, qty: number, maxStock: number) => {
      const result = add(item, qty, maxStock);
      if (result === 'line-limit') {
        toast.error('Your bag is full', {
          description: `Orders can contain up to ${MAX_ORDER_LINES} different items.`,
        });
      } else if (result === 'qty-limit') {
        toast.info('Maximum quantity reached', {
          description: `No more ${item.size} available for this item.`,
        });
      } else if (window.matchMedia('(min-width: 1024px)').matches) {
        // On desktop the opening drawer is the confirmation.
        open('cart');
      } else {
        toast.success('Added to bag', {
          description: `${item.name} · ${item.color} · ${item.size}`,
          action: { label: 'View bag', href: '/cart' },
        });
      }
      return result;
    },
    [add, open],
  );
}
