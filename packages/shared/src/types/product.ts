import type { DateField, ImageAsset, KES } from './common';

export type Gender = 'men' | 'women' | 'unisex';
export type ProductStatus = 'active' | 'draft';

export interface ProductImage extends ImageAsset {
  /** Optional color name this image belongs to (used to switch gallery on swatch click). */
  color?: string;
}

export interface ProductColor {
  name: string;
  hex: string;
}

/** Variant definition. Stock lives in `inventory/{productId}__{key}` so rules can validate decrements. */
export interface ProductVariant {
  /** Stable key: slug(color)_slug(size), e.g. "black_m". */
  key: string;
  color: string;
  size: string;
  sku?: string;
}

export interface Product {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  materialCare: string;
  categoryId: string;
  collectionIds: string[];
  tags: string[];
  searchKeywords: string[];
  gender: Gender;
  price: KES;
  compareAtPrice: KES | null;
  images: ProductImage[];
  colors: ProductColor[];
  /** Colour names, denormalised for `array-contains-any` filtering. */
  colorNames: string[];
  sizes: string[];
  variants: ProductVariant[];
  /** Denormalised sum of inventory stock, for listings and "in stock" filters. */
  totalStock: number;
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  /** compareAtPrice > price — stored so "Sale" can be an equality filter. */
  isOnSale: boolean;
  status: ProductStatus;
  salesCount: number;
  ratingAvg: number;
  ratingCount: number;
  /** Set by checkout when it decrements totalStock; rules verify that order is created in the same transaction. */
  lastOrderId: string | null;
  createdAt: DateField;
  updatedAt: DateField;
}

export interface InventoryItem {
  productId: string;
  variantKey: string;
  color: string;
  size: string;
  sku?: string;
  stock: number;
  /** Null → use store-wide threshold from settings. */
  lowStockThreshold: number | null;
  /** Order that last decremented this doc (rules check it exists after the write). */
  lastOrderId: string | null;
  updatedAt: DateField;
}

export interface Category {
  name: string;
  slug: string;
  description: string;
  image: ImageAsset | null;
  sortOrder: number;
  isVisible: boolean;
}

export interface Collection {
  name: string;
  slug: string;
  description: string;
  image: ImageAsset | null;
  sortOrder: number;
  isVisible: boolean;
}

/**
 * Compact listing entry in `meta/catalogIndex`. The storefront's shop, search, home rails,
 * wishlist and recently-viewed all render from this single document (1 read per visit)
 * instead of paginating `products` (12+ reads per page). Fits ~2,000 products under 1 MiB.
 */
export interface CatalogIndexEntry {
  id: string;
  name: string;
  slug: string;
  /** Up to two image URLs: primary + hover. */
  images: string[];
  price: KES;
  compareAtPrice: KES | null;
  categoryId: string;
  collectionIds: string[];
  gender: Gender;
  tags: string[];
  colors: ProductColor[];
  sizes: string[];
  totalStock: number;
  isNew: boolean;
  isOnSale: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  salesCount: number;
  ratingAvg: number;
  ratingCount: number;
  /** Epoch millis (plain number keeps the index doc compact and sortable). */
  createdAt: number;
  /** Lowercased search tokens: name words, tags, category, colours. */
  keywords: string[];
}

export interface CatalogIndex {
  entries: CatalogIndexEntry[];
  updatedAt: DateField;
}
