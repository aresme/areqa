import type { CatalogIndexEntry, Product } from '../types/product';
import { toDate } from './dates';

/** Builds the compact listing entry for `meta/catalogIndex` (used by admin saves and the seed). */
export function toCatalogEntry(
  id: string,
  p: Omit<Product, 'createdAt' | 'updatedAt'> & { createdAt?: Product['createdAt'] },
  categoryName = '',
): CatalogIndexEntry {
  const keywords = new Set<string>();
  const add = (text: string) =>
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 1)
      .forEach((w) => keywords.add(w));
  [p.name, categoryName, p.gender, ...p.tags, ...p.colors.map((c) => c.name)].forEach(add);

  return {
    id,
    name: p.name,
    slug: p.slug,
    images: p.images.slice(0, 2).map((i) => i.url),
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    categoryId: p.categoryId,
    collectionIds: p.collectionIds,
    gender: p.gender,
    tags: p.tags,
    colors: p.colors,
    sizes: p.sizes,
    totalStock: p.totalStock,
    isNew: p.isNew,
    isOnSale: p.isOnSale,
    isFeatured: p.isFeatured,
    isBestSeller: p.isBestSeller,
    salesCount: p.salesCount,
    ratingAvg: p.ratingAvg,
    ratingCount: p.ratingCount,
    createdAt: toDate(p.createdAt ?? null)?.getTime() ?? Date.now(),
    keywords: [...keywords],
  };
}
