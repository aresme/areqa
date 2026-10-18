import { describe, expect, it } from 'vitest';
import type { CatalogIndexEntry } from '@areqa/shared';
import { applyFilters, matchesSearch, parseFilters, withFilters } from './filters';

const e = (over: Partial<CatalogIndexEntry>): CatalogIndexEntry => ({
  id: 'x',
  name: 'Item',
  slug: 'x',
  images: [],
  price: 1000,
  compareAtPrice: null,
  categoryId: 'shirts',
  collectionIds: [],
  gender: 'men',
  tags: [],
  colors: [{ name: 'Black', hex: '#000' }],
  sizes: ['M'],
  totalStock: 5,
  isNew: false,
  isOnSale: false,
  isFeatured: false,
  isBestSeller: false,
  salesCount: 0,
  ratingAvg: 0,
  ratingCount: 0,
  createdAt: 0,
  keywords: [],
  ...over,
});

describe('shop filters', () => {
  const items = [
    e({ id: 'a', price: 1500, sizes: ['S', 'M'], createdAt: 3, salesCount: 5 }),
    e({
      id: 'b',
      price: 900,
      isOnSale: true,
      colors: [{ name: 'White', hex: '#fff' }],
      createdAt: 2,
      salesCount: 50,
    }),
    e({ id: 'c', price: 4000, totalStock: 0, createdAt: 9 }),
  ];
  it('parses URL params and round-trips updates', () => {
    const p = withFilters(new URLSearchParams('sort=price_asc'), {
      size: ['M', 'L'],
      min: '1000',
      sale: null,
    });
    const f = parseFilters(p);
    expect(f).toMatchObject({
      sizes: ['M', 'L'],
      minPrice: 1000,
      sort: 'price_asc',
      onSale: false,
    });
  });
  it('filters by size, colour, price, stock and sale', () => {
    expect(
      applyFilters(items, parseFilters(new URLSearchParams('size=S'))).map((x) => x.id),
    ).toEqual(['a']);
    expect(
      applyFilters(items, parseFilters(new URLSearchParams('color=White'))).map((x) => x.id),
    ).toEqual(['b']);
    expect(
      applyFilters(items, parseFilters(new URLSearchParams('min=1000&max=2000'))).map((x) => x.id),
    ).toEqual(['a']);
    expect(
      applyFilters(items, parseFilters(new URLSearchParams('stock=in'))).map((x) => x.id),
    ).toEqual(['a', 'b']);
    expect(
      applyFilters(items, parseFilters(new URLSearchParams('sale=1'))).map((x) => x.id),
    ).toEqual(['b']);
  });
  it('sorts with sold-out items last', () => {
    expect(applyFilters(items, parseFilters(new URLSearchParams())).map((x) => x.id)).toEqual([
      'a',
      'b',
      'c',
    ]);
    expect(
      applyFilters(items, parseFilters(new URLSearchParams('sort=price_desc'))).map((x) => x.id),
    ).toEqual(['a', 'b', 'c']);
    expect(
      applyFilters(items, parseFilters(new URLSearchParams('sort=best_selling'))).map((x) => x.id),
    ).toEqual(['b', 'a', 'c']);
  });
  it('matches every search token by prefix', () => {
    const tee = e({
      name: 'Essential Cotton Tee',
      keywords: ['essential', 'cotton', 'tee', 'white'],
    });
    expect(matchesSearch(tee, 'cot whi')).toBe(true);
    expect(matchesSearch(tee, 'cotton dress')).toBe(false);
  });
});
