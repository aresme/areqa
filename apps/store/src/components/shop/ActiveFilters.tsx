import { X } from 'lucide-react';
import { GENDER_LABELS, formatKES, type Category, type WithId } from '@areqa/shared';
import type { FilterUpdates, ShopFilters } from '@/features/catalog/filters';

interface Chip {
  key: string;
  label: string;
  remove: () => void;
}

export function ActiveFilters({
  filters,
  categories,
  onChange,
  onClear,
}: {
  filters: ShopFilters;
  categories: WithId<Category>[];
  onChange: (updates: FilterUpdates) => void;
  onClear: () => void;
}) {
  const chips: Chip[] = [
    ...filters.categories.map((id) => ({
      key: `c-${id}`,
      label: categories.find((c) => c.id === id)?.name ?? id,
      remove: () => onChange({ category: filters.categories.filter((x) => x !== id) }),
    })),
    ...filters.genders.map((g) => ({
      key: `g-${g}`,
      label: GENDER_LABELS[g],
      remove: () => onChange({ gender: filters.genders.filter((x) => x !== g) }),
    })),
    ...filters.sizes.map((s) => ({
      key: `s-${s}`,
      label: `Size ${s}`,
      remove: () => onChange({ size: filters.sizes.filter((x) => x !== s) }),
    })),
    ...filters.colors.map((c) => ({
      key: `col-${c}`,
      label: c,
      remove: () => onChange({ color: filters.colors.filter((x) => x !== c) }),
    })),
  ];
  if (filters.minPrice !== null || filters.maxPrice !== null) {
    chips.push({
      key: 'price',
      label: `${filters.minPrice !== null ? formatKES(filters.minPrice) : 'Any'} – ${filters.maxPrice !== null ? formatKES(filters.maxPrice) : 'Any'}`,
      remove: () => onChange({ min: null, max: null }),
    });
  }
  if (filters.inStock)
    chips.push({ key: 'stock', label: 'In stock', remove: () => onChange({ stock: null }) });
  if (filters.onSale)
    chips.push({ key: 'sale', label: 'On sale', remove: () => onChange({ sale: null }) });
  if (filters.q)
    chips.push({ key: 'q', label: `“${filters.q}”`, remove: () => onChange({ q: null }) });
  if (chips.length === 0) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={c.remove}
          aria-label={`Remove filter ${c.label}`}
          className="bg-mist hover:bg-mint inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
        >
          {c.label}
          <X className="size-3" aria-hidden />
        </button>
      ))}
      <button
        type="button"
        onClick={onClear}
        className="ml-1 text-xs font-semibold underline underline-offset-4"
      >
        Clear all
      </button>
    </div>
  );
}
