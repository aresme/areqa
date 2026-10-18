import { Check } from 'lucide-react';
import { GENDER_LABELS, type Category, type Gender, type WithId } from '@areqa/shared';
import type { FilterUpdates, ShopFilters, facetsFor } from '@/features/catalog/filters';
import { cn } from '@/lib/cn';
import { PriceRange } from './PriceRange';

type Facets = ReturnType<typeof facetsFor>;

interface FilterPanelProps {
  filters: ShopFilters;
  facets: Facets;
  categories: WithId<Category>[];
  showCategory: boolean;
  showGender: boolean;
  onChange: (updates: FilterUpdates) => void;
}

function toggle<T extends string>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-line border-b py-6 first:pt-0">
      <legend className="label float-left mb-4 w-full">{title}</legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  );
}

function CheckRow({
  checked,
  onChange,
  label,
  count,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  count?: number;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-1.5 text-sm">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className="border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:ring-mint-strong flex size-[18px] items-center justify-center rounded-sm border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2"
        aria-hidden
      >
        {checked && <Check className="size-3" strokeWidth={3} />}
      </span>
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="text-muted text-xs">{count}</span>}
    </label>
  );
}

export function FilterPanel({
  filters,
  facets,
  categories,
  showCategory,
  showGender,
  onChange,
}: FilterPanelProps) {
  const cats = categories.filter((c) => facets.categories.has(c.id));
  return (
    <div>
      {showCategory && cats.length > 1 && (
        <Group title="Category">
          {cats.map((c) => (
            <CheckRow
              key={c.id}
              label={c.name}
              count={facets.categories.get(c.id)}
              checked={filters.categories.includes(c.id)}
              onChange={() => onChange({ category: toggle(filters.categories, c.id) })}
            />
          ))}
        </Group>
      )}

      {showGender && facets.genders.length > 1 && (
        <Group title="Gender">
          {(Object.keys(GENDER_LABELS) as Gender[])
            .filter((g) => facets.genders.includes(g))
            .map((g) => (
              <CheckRow
                key={g}
                label={GENDER_LABELS[g]}
                checked={filters.genders.includes(g)}
                onChange={() => onChange({ gender: toggle(filters.genders, g) })}
              />
            ))}
        </Group>
      )}

      {facets.sizes.length > 1 && (
        <Group title="Size">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(3.5rem,1fr))] gap-2">
            {facets.sizes.map((s) => {
              const on = filters.sizes.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onChange({ size: toggle(filters.sizes, s) })}
                  className={cn(
                    'h-10 whitespace-nowrap rounded border px-1 text-xs font-medium transition-colors',
                    on ? 'border-ink bg-mint' : 'border-line hover:border-ink',
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </Group>
      )}

      {facets.colors.length > 1 && (
        <Group title="Colour">
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            {facets.colors.map((c) => {
              const on = filters.colors.includes(c.name);
              return (
                <button
                  key={c.name}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onChange({ color: toggle(filters.colors, c.name) })}
                  className="flex items-center gap-2.5 rounded py-1.5 text-left text-sm"
                >
                  <span
                    className={cn(
                      'size-5 shrink-0 rounded-full border ring-offset-2',
                      on ? 'border-ink ring-ink ring-2' : 'border-line',
                    )}
                    style={{ backgroundColor: c.hex }}
                    aria-hidden
                  />
                  <span className={cn('truncate', on && 'font-semibold')}>{c.name}</span>
                </button>
              );
            })}
          </div>
        </Group>
      )}

      <Group title="Price">
        <PriceRange
          min={facets.priceMin}
          max={facets.priceMax}
          value={[filters.minPrice, filters.maxPrice]}
          onCommit={([lo, hi]) =>
            onChange({ min: lo === null ? null : String(lo), max: hi === null ? null : String(hi) })
          }
        />
      </Group>

      <Group title="Availability">
        <CheckRow
          label="In stock only"
          checked={filters.inStock}
          onChange={() => onChange({ stock: filters.inStock ? null : 'in' })}
        />
        <CheckRow
          label="On sale"
          checked={filters.onSale}
          onChange={() => onChange({ sale: filters.onSale ? null : '1' })}
        />
      </Group>
    </div>
  );
}
