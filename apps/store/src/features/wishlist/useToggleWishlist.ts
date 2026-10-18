import { useCallback } from 'react';
import { toast } from '@/features/ui/toastStore';
import { useWishlist } from './wishlistStore';

export function useToggleWishlist() {
  const toggle = useWishlist((s) => s.toggle);
  return useCallback(
    (id: string, name: string) => {
      const on = toggle(id);
      if (on)
        toast.success('Saved to wishlist', {
          description: name,
          action: { label: 'View wishlist', href: '/wishlist' },
        });
      else toast.info('Removed from wishlist', { description: name });
    },
    [toggle],
  );
}
