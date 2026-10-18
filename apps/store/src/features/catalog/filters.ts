import {
  SIZE_ORDER,
  SORT_OPTIONS,
  type CatalogIndexEntry,
  type Gender,
  type SortOption,
} from '@areqa/shared';

export interface ShopFilters {
  categories: string[];
  genders: Gender[];
  sizes: string[];
  colors: string[];
  minPrice: number | null;
  maxPrice: number | null;
  inStock: boolean;
  onSale: boolean;
  q: string;
  sort: SortOption;
}

const list = (v: string | null) => (v ? v.split(',').filter(Boolean) : []);
const num = (v: string | null) => (v && Number.isFinite(Number(v)) ? Number(v) : null);

export function parseFilters(params: URLSearchParams): ShopFilters {
  const sort = params.get('sort') as SortOption | null;
  return {
    categories: list(params.get('category')),
    genders: list(params.get('gender')) as Gender[],
    sizes: list(params.get('size')),
    colors: list(params.get('color')),
    minPrice: num(params.get('min')),
    maxPrice: num(params.get('max')),
    inStock: params.get('stock') === 'in',
    onSale: params.get('sale') === '1',
    q: params.get('q')?.trim() ?? '',
    sort: SORT_OPTIONS.some((o) => o.value === sort) ? sort! : 'newest',
  };
}

export type FilterUpdates = Record<string, string | string[] | null>;

/** Returns new params with the given filters changed (empty value removes the key). */
export function withFilters(params: URLSearchParams, updates: FilterUpdates): URLSearchParams {
  const next = new URLSearchParams(params);
  for (const [key, value] of Object.entries(updates)) {
    const v = Array.isArray(value) ? value.join(',') : value;
    if (v) next.set(key, v);
    else next.delete(key);
  }
  return next;
}

export function countActive(f: ShopFilters): number {
  return (
    f.categories.length +
    f.genders.length +
    f.sizes.length +
    f.colors.length +
    (f.minPrice !== null || f.maxPrice !== null ? 1 : 0) +
    (f.inStock ? 1 : 0) +
    (f.onSale ? 1 : 0)
  );
}

/** All query tokens must prefix-match a keyword or appear in the name. */
export function matchesSearch(entry: CatalogIndexEntry, q: string): boolean {
  const tokens = q
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  if (tokens.length === 0) return true;
  const name = entry.name.toLowerCase();
  return tokens.every((t) => name.includes(t) || entry.keywords.some((k) => k.startsWith(t)));
}

export function applyFilters(entries: CatalogIndexEntry[], f: ShopFilters): CatalogIndexEntry[] {
  const out = entries.filter(
    (e) =>
      (f.categories.length === 0 || f.categories.includes(e.categoryId)) &&
      (f.genders.length === 0 || f.genders.includes(e.gender)) &&
      (f.sizes.length === 0 || e.sizes.some((s) => f.sizes.includes(s))) &&
      (f.colors.length === 0 || e.colors.some((c) => f.colors.includes(c.name))) &&
      (f.minPrice === null || e.price >= f.minPrice) &&
      (f.maxPrice === null || e.price <= f.maxPrice) &&
      (!f.inStock || e.totalStock > 0) &&
      (!f.onSale || e.isOnSale) &&
      matchesSearch(e, f.q),
  );
  return sortEntries(out, f.sort);
}

export function sortEntries(entries: CatalogIndexEntry[], sort: SortOption): CatalogIndexEntry[] {
  const sorted = [...entries];
  const soldOutLast = (a: CatalogIndexEntry, b: CatalogIndexEntry) =>
    Number(b.totalStock > 0) - Number(a.totalStock > 0);
  switch (sort) {
    case 'price_asc':
      return sorted.sort((a, b) => soldOutLast(a, b) || a.price - b.price);
    case 'price_desc':
      return sorted.sort((a, b) => soldOutLast(a, b) || b.price - a.price);
    case 'best_selling':
      return sorted.sort((a, b) => soldOutLast(a, b) || b.salesCount - a.salesCount);
    default:
      return sorted.sort((a, b) => soldOutLast(a, b) || b.createdAt - a.createdAt);
  }
}

/** Filter options available within the current scope (so we never offer dead-end filters). */
export function facetsFor(entries: CatalogIndexEntry[]) {
  const sizes = new Set<string>();
  const colors = new Map<string, string>();
  const categories = new Map<string, number>();
  const genders = new Set<Gender>();
  let min = Infinity;
  let max = 0;
  for (const e of entries) {
    e.sizes.forEach((s) => sizes.add(s));
    e.colors.forEach((c) => colors.set(c.name, c.hex));
    categories.set(e.categoryId, (categories.get(e.categoryId) ?? 0) + 1);
    genders.add(e.gender);
    min = Math.min(min, e.price);
    max = Math.max(max, e.price);
  }
  const order = (s: string) => {
    const i = SIZE_ORDER.indexOf(s);
    return i === -1 ? 999 : i;
  };
  return {
    sizes: [...sizes].sort((a, b) => order(a) - order(b)),
    colors: [...colors]
      .map(([name, hex]) => ({ name, hex }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    categories,
    genders: [...genders],
    priceMin: Number.isFinite(min) ? Math.floor(min / 100) * 100 : 0,
    priceMax: max ? Math.ceil(max / 100) * 100 : 0,
  };
}
