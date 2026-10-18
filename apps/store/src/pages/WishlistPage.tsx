import { Heart } from 'lucide-react';
import { ProductGrid, ProductGridSkeleton } from '@/components/product/ProductGrid';
import { Seo } from '@/components/Seo';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCatalog, useCatalogMap } from '@/features/catalog/hooks';
import { useWishlist } from '@/features/wishlist/wishlistStore';

export default function WishlistPage() {
  const ids = useWishlist((s) => s.ids);
  const { isLoading } = useCatalog();
  const catalog = useCatalogMap();
  const entries = ids.map((id) => catalog.get(id)).filter((e) => e !== undefined);

  return (
    <div className="container-page pb-20 pt-8 sm:pt-12">
      <Seo title="Wishlist" noIndex />
      <h1 className="text-display uppercase">
        Wishlist {entries.length > 0 && <span className="text-muted">({entries.length})</span>}
      </h1>
      <p className="text-muted mt-2 text-sm">
        Saved on this device. Sign in to keep your wishlist across devices.
      </p>
      <div className="mt-10">
        {isLoading && ids.length > 0 ? (
          <ProductGridSkeleton count={Math.min(ids.length, 8)} />
        ) : entries.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Nothing saved yet"
            body="Tap the heart on any product to save it for later."
            action={<ButtonLink to="/shop">Discover pieces</ButtonLink>}
          />
        ) : (
          <ProductGrid entries={entries} priorityCount={0} />
        )}
      </div>
    </div>
  );
}
