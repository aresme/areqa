import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import type { CatalogIndexEntry } from '@areqa/shared';
import { Img } from '@/components/ui/Img';
import { Price } from '@/components/ui/Price';
import { cn } from '@/lib/cn';
import { ProductBadges } from './ProductBadges';
import { useQuickAdd } from './quickAdd';
import { WishlistButton } from './WishlistButton';

interface ProductCardProps {
  entry: CatalogIndexEntry;
  priority?: boolean;
  sizes?: string;
  layout?: 'grid' | 'list';
}

export function ProductCard({
  entry,
  priority,
  sizes = '(min-width:1024px) 25vw, 50vw',
  layout = 'grid',
}: ProductCardProps) {
  const quickAdd = useQuickAdd();
  const [primary, hover] = entry.images;
  const soldOut = entry.totalStock === 0;

  return (
    <article
      className={cn(
        'group relative',
        layout === 'list' && 'grid grid-cols-[40%_1fr] gap-4 sm:grid-cols-[220px_1fr] sm:gap-6',
      )}
    >
      <div className="aspect-product bg-mist relative overflow-hidden rounded">
        <Link to={`/product/${entry.slug}`} tabIndex={-1} aria-hidden>
          <Img
            src={primary ?? ''}
            alt=""
            aspect={0.8}
            sizes={sizes}
            priority={priority}
            maxWidth={1080}
            className={cn(
              'absolute inset-0 size-full object-cover transition-all duration-700 group-hover:scale-[1.03]',
              hover && 'lg:group-hover:opacity-0',
              soldOut && 'opacity-70',
            )}
          />
          {hover && (
            <Img
              src={hover}
              alt=""
              aspect={0.8}
              sizes={sizes}
              maxWidth={1080}
              className="absolute inset-0 hidden size-full object-cover opacity-0 transition-opacity duration-700 lg:block lg:group-hover:opacity-100"
            />
          )}
        </Link>
        <div className="pointer-events-none absolute left-2 top-2 flex flex-col items-start gap-1">
          <ProductBadges entry={entry} />
        </div>
        <WishlistButton productId={entry.id} name={entry.name} className="absolute right-2 top-2" />
        {!soldOut && (
          <button
            type="button"
            onClick={() => quickAdd(entry)}
            aria-label={`Quick add ${entry.name}`}
            className="bg-paper shadow-soft hover:bg-mint absolute bottom-2 right-2 flex size-9 items-center justify-center rounded-full transition-all lg:inset-x-2 lg:bottom-2 lg:h-10 lg:w-auto lg:translate-y-2 lg:rounded lg:opacity-0 lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100 lg:group-hover:translate-y-0 lg:group-hover:opacity-100"
          >
            <Plus className="size-4 lg:hidden" aria-hidden />
            <span className="hidden text-xs font-semibold uppercase tracking-[0.08em] lg:inline">
              Quick add
            </span>
          </button>
        )}
      </div>
      <div className={cn(layout === 'grid' ? 'mt-3' : 'flex flex-col justify-center')}>
        <h3 className="text-sm font-medium leading-snug">
          <Link to={`/product/${entry.slug}`} className="hover:underline">
            {entry.name}
          </Link>
        </h3>
        <Price price={entry.price} compareAt={entry.compareAtPrice} className="mt-1 text-sm" />
        {entry.colors.length > 1 && (
          <ul className="mt-2 flex gap-1.5" aria-label={`${entry.colors.length} colours`}>
            {entry.colors.map((c) => (
              <li
                key={c.name}
                title={c.name}
                className="border-line size-3 rounded-full border"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
