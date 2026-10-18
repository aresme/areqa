import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CatalogIndexEntry } from '@areqa/shared';
import { IconButton } from '@/components/ui/IconButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { ProductCard } from './ProductCard';

/** Native scroll-snap rail: swipeable on touch, arrow buttons on desktop, no carousel library. */
export function ProductCarousel({
  entries,
  loading,
  label,
}: {
  entries: CatalogIndexEntry[];
  loading?: boolean;
  label: string;
}) {
  const rail = useRef<HTMLUListElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = rail.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div className="absolute -top-14 right-0 hidden gap-1 md:flex">
        <IconButton
          label={`Scroll ${label} left`}
          onClick={() => scroll(-1)}
          className="border-line border"
        >
          <ChevronLeft className="size-4" />
        </IconButton>
        <IconButton
          label={`Scroll ${label} right`}
          onClick={() => scroll(1)}
          className="border-line border"
        >
          <ChevronRight className="size-4" />
        </IconButton>
      </div>
      <ul
        ref={rail}
        aria-label={label}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:gap-5 sm:px-6 lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {loading
          ? Array.from({ length: 4 }, (_, i) => (
              <li
                key={i}
                className="w-[46%] shrink-0 snap-start space-y-3 sm:w-[31%] lg:w-[calc(25%-15px)]"
              >
                <Skeleton className="aspect-product w-full" />
                <Skeleton className="h-4 w-3/4" />
              </li>
            ))
          : entries.map((e) => (
              <li
                key={e.id}
                className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[calc(25%-15px)]"
              >
                <ProductCard entry={e} sizes="(min-width:1024px) 25vw, 46vw" />
              </li>
            ))}
      </ul>
    </div>
  );
}
