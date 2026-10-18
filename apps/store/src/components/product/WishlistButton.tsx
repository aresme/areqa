import { Heart } from 'lucide-react';
import { useToggleWishlist } from '@/features/wishlist/useToggleWishlist';
import { useWishlist } from '@/features/wishlist/wishlistStore';
import { cn } from '@/lib/cn';

export function WishlistButton({
  productId,
  name,
  className,
}: {
  productId: string;
  name: string;
  className?: string;
}) {
  const saved = useWishlist((s) => s.ids.includes(productId));
  const toggle = useToggleWishlist();
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId, name);
      }}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
      className={cn(
        'bg-paper/90 hover:bg-mint flex size-9 items-center justify-center rounded-full backdrop-blur transition-colors',
        className,
      )}
    >
      <Heart
        className={cn('size-4 transition-transform', saved && 'fill-ink scale-110')}
        aria-hidden
      />
    </button>
  );
}
