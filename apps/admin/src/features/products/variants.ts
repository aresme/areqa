import { slugify, variantKey, type ProductColor } from '@areqa/shared';
import type { VariantRow } from './types';

/** Rebuilds the colour × size matrix, keeping stock/SKU for combinations that still exist. */
export function buildMatrix(
  colors: ProductColor[],
  sizes: string[],
  previous: VariantRow[],
  productSlug: string,
): VariantRow[] {
  const prev = new Map(previous.map((v) => [v.key, v]));
  const colorList = colors.length > 0 ? colors : [{ name: 'Default', hex: '#0B0B0B' }];
  const sizeList = sizes.length > 0 ? sizes : ['One size'];
  return colorList.flatMap((c) =>
    sizeList.map((size) => {
      const key = variantKey(c.name, size);
      return (
        prev.get(key) ?? {
          key,
          color: c.name,
          size,
          sku: suggestSku(productSlug, c.name, size),
          stock: 0,
          lowStockThreshold: null,
        }
      );
    }),
  );
}

export function suggestSku(slug: string, color: string, size: string): string {
  const base = slug.replace(/-/g, '').slice(0, 6).toUpperCase() || 'ITEM';
  return `AQ-${base}-${slugify(color).slice(0, 3).toUpperCase()}-${slugify(size).toUpperCase()}`;
}
