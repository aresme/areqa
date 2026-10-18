import { describe, expect, it } from 'vitest';
import type { CartLine } from '@areqa/shared';
import { mergeCarts, mergeWishlists } from './mergeCart';

const line = (variantKey: string, qty: number): CartLine => ({
  productId: 'p',
  variantKey,
  slug: 'p',
  name: 'P',
  image: '',
  color: 'Black',
  size: 'M',
  price: 100,
  qty,
});

describe('cart merge on sign-in', () => {
  it('keeps the larger quantity for the same variant and unions the rest', () => {
    const merged = mergeCarts([line('a', 1), line('b', 3)], [line('a', 2), line('c', 1)]);
    expect(merged.map((l) => [l.variantKey, l.qty])).toEqual([
      ['a', 2],
      ['c', 1],
      ['b', 3],
    ]);
  });
  it('caps at 10 lines', () => {
    const many = Array.from({ length: 12 }, (_, i) => line(`v${i}`, 1));
    expect(mergeCarts(many, [])).toHaveLength(10);
  });
  it('dedupes wishlists', () =>
    expect(mergeWishlists(['a', 'b'], ['b', 'c'])).toEqual(['a', 'b', 'c']));
});
