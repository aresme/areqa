import type { CatalogIndexEntry } from '@areqa/shared';

/** Scores catalog entries by similarity: same category, shared collection/tags, same gender. */
export function relatedProducts(
  all: CatalogIndexEntry[],
  current: CatalogIndexEntry | undefined,
  limit = 8,
): CatalogIndexEntry[] {
  if (!current) return [];
  return all
    .filter((e) => e.id !== current.id && e.totalStock > 0)
    .map((e) => {
      let score = 0;
      if (e.categoryId === current.categoryId) score += 3;
      if (e.collectionIds.some((c) => current.collectionIds.includes(c))) score += 2;
      score += e.tags.filter((t) => current.tags.includes(t)).length;
      if (e.gender === current.gender) score += 1;
      return { e, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.e.salesCount - a.e.salesCount)
    .slice(0, limit)
    .map((x) => x.e);
}
