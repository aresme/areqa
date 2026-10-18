import type { CatalogIndexEntry } from '@areqa/shared';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';
import { ProductCard } from './ProductCard';

export type Density = 'comfortable' | 'compact' | 'list';

const cols: Record<Density, string> = {
  comfortable: 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  compact: 'grid-cols-3 lg:grid-cols-5',
  list: 'grid-cols-1 md:grid-cols-2',
};

export function ProductGrid({
  entries,
  density = 'comfortable',
  priorityCount = 4,
}: {
  entries: CatalogIndexEntry[];
  density?: Density;
  priorityCount?: number;
}) {
  return (
    <ul className={cn('grid gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10', cols[density])}>
      {entries.map((e, i) => (
        <li key={e.id}>
          <ProductCard
            entry={e}
            priority={i < priorityCount}
            layout={density === 'list' ? 'list' : 'grid'}
            sizes={density === 'compact' ? '(min-width:1024px) 20vw, 33vw' : undefined}
          />
        </li>
      ))}
    </ul>
  );
}

export function ProductGridSkeleton({
  count = 8,
  density = 'comfortable',
}: {
  count?: number;
  density?: Density;
}) {
  return (
    <ul
      className={cn('grid gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10', cols[density])}
      aria-label="Loading products"
      role="status"
    >
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="space-y-3">
          <Skeleton className="aspect-product w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
        </li>
      ))}
    </ul>
  );
}
