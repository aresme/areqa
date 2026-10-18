/** Pure builders that turn seed data into Firestore documents. No I/O here. */
import { APPAREL_SIZES, ONE_SIZE, SIZE_PRESETS } from '../../packages/shared/src/constants';
import type { InventoryItem, Product, ProductImage } from '../../packages/shared/src/types';
import { buildSearchKeywords, slugify, variantKey } from '../../packages/shared/src/utils/text';
import type { SeedProduct } from './data/catalog';

/** Deterministic PRNG so every seed run produces identical stock levels. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(text: string) {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

function resolveSizes(sizes: SeedProduct['sizes']): string[] {
  if (sizes === 'apparel') return [...APPAREL_SIZES];
  if (sizes === 'waist') return [...SIZE_PRESETS.waist];
  if (sizes === 'one') return [ONE_SIZE];
  return sizes;
}

function stockFor(profile: SeedProduct['stock'], rand: () => number, index: number): number {
  switch (profile) {
    case 'low':
      return 1 + Math.floor(rand() * 3);
    case 'mixed':
      return index % 4 === 1 ? 0 : 2 + Math.floor(rand() * 10);
    default:
      return 4 + Math.floor(rand() * 22);
  }
}

export type ImageResolver = (
  url: string,
) => Promise<{ url: string; publicId: string; width?: number; height?: number }>;

export interface BuiltProduct {
  id: string;
  product: Omit<Product, 'createdAt' | 'updatedAt'>;
  inventory: (Omit<InventoryItem, 'updatedAt'> & { id: string })[];
  categoryName: string;
}

export async function buildProduct(
  seed: SeedProduct,
  categoryId: string,
  categoryName: string,
  resolveImage: ImageResolver,
): Promise<BuiltProduct> {
  const id = slugify(seed.name);
  const sizes = resolveSizes(seed.sizes);
  const rand = mulberry32(hash(id));

  const images: ProductImage[] = [];
  const seen = new Set<string>();
  for (const color of seed.colors) {
    for (const src of color.images) {
      // Shared images (e.g. one flat-lay for several colours) are stored once, untagged.
      const shared = seed.colors.filter((c) => c.images.includes(src)).length > 1;
      if (seen.has(src)) continue;
      seen.add(src);
      const up = await resolveImage(src);
      images.push({
        url: up.url,
        publicId: up.publicId,
        alt: `${seed.name}${shared ? '' : ` in ${color.name}`}`,
        ...(shared ? {} : { color: color.name }),
        ...(up.width ? { width: up.width, height: up.height } : {}),
      });
    }
  }

  const variants = seed.colors.flatMap((c) =>
    sizes.map((size) => ({
      key: variantKey(c.name, size),
      color: c.name,
      size,
      sku: `AQ-${id.slice(0, 6).toUpperCase().replace(/-/g, '')}-${slugify(c.name).slice(0, 3).toUpperCase()}-${slugify(size).toUpperCase()}`,
    })),
  );

  const inventory = variants.map((v, i) => ({
    id: `${id}__${v.key}`,
    productId: id,
    variantKey: v.key,
    color: v.color,
    size: v.size,
    sku: v.sku,
    stock: stockFor(seed.stock, rand, i),
    lowStockThreshold: null,
    lastOrderId: null,
  }));

  const totalStock = inventory.reduce((sum, item) => sum + item.stock, 0);
  const keywords = buildSearchKeywords(
    seed.name,
    seed.tags,
    categoryName,
    seed.gender,
    seed.colors.map((c) => c.name),
  );

  const product: BuiltProduct['product'] = {
    name: seed.name,
    slug: id,
    description: seed.description,
    shortDescription: seed.short,
    materialCare: seed.material,
    categoryId,
    collectionIds: seed.collections ?? [],
    tags: seed.tags,
    searchKeywords: keywords,
    gender: seed.gender,
    price: seed.price,
    compareAtPrice: seed.compareAt ?? null,
    images,
    colors: seed.colors.map(({ name, hex }) => ({ name, hex })),
    colorNames: seed.colors.map((c) => c.name),
    sizes,
    variants,
    totalStock,
    isFeatured: Boolean(seed.flags?.featured),
    isNew: Boolean(seed.flags?.new),
    isBestSeller: Boolean(seed.flags?.best),
    isOnSale: Boolean(seed.compareAt && seed.compareAt > seed.price),
    status: 'active',
    salesCount: seed.salesCount ?? 0,
    ratingAvg: 0,
    ratingCount: 0,
    lastOrderId: null,
  };

  return { id, product, inventory, categoryName };
}
