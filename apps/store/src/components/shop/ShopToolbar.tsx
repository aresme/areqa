import { LayoutGrid, Grid3x3, List, SlidersHorizontal } from 'lucide-react';
import { SORT_OPTIONS, type SortOption } from '@areqa/shared';
import type { Density } from '@/components/product/ProductGrid';
import { cn } from '@/lib/cn';

interface ShopToolbarProps {
  count: number;
  sort: SortOption;
  density: Density;
  activeCount: number;
  onSort: (s: SortOption) => void;
  onDensity: (d: Density) => void;
  onOpenFilters: () => void;
}

const DENSITIES: { value: Density; label: string; icon: typeof List }[] = [
  { value: 'comfortable', label: 'Large grid', icon: LayoutGrid },
  { value: 'compact', label: 'Compact grid', icon: Grid3x3 },
  { value: 'list', label: 'List view', icon: List },
];

export function ShopToolbar({
  count,
  sort,
  density,
  activeCount,
  onSort,
  onDensity,
  onOpenFilters,
}: ShopToolbarProps) {
  return (
    <div className="border-line bg-paper/95 sticky top-14 z-20 -mx-4 mb-6 flex items-center gap-3 border-b px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
      <button
        type="button"
        onClick={onOpenFilters}
        className="border-ink inline-flex h-10 items-center gap-2 rounded border px-4 text-xs font-semibold uppercase tracking-[0.08em] lg:hidden"
      >
        <SlidersHorizontal className="size-4" aria-hidden />
        Filter
        {activeCount > 0 && (
          <span className="bg-mint flex size-5 items-center justify-center rounded-full text-[10px]">
            {activeCount}
          </span>
        )}
      </button>
      <p className="text-muted hidden text-sm lg:block" aria-live="polite">
        {count} {count === 1 ? 'product' : 'products'}
      </p>
      <div className="ml-auto flex items-center gap-2">
        <label htmlFor="sort" className="sr-only">
          Sort by
        </label>
        <select
          id="sort"
          value={sort}
          onChange={(e) => onSort(e.target.value as SortOption)}
          className="border-line bg-paper hover:border-ink h-10 cursor-pointer rounded border pl-3 pr-8 text-sm"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div
          className="border-line hidden items-center rounded border sm:flex"
          role="group"
          aria-label="Layout"
        >
          {DENSITIES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => onDensity(value)}
              aria-pressed={density === value}
              aria-label={label}
              title={label}
              className={cn(
                'flex size-10 items-center justify-center transition-colors',
                density === value ? 'bg-ink text-paper' : 'hover:bg-mist',
              )}
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
