import type { Gender, ProductColor, ProductImage, ProductStatus } from '@areqa/shared';

export interface VariantRow {
  key: string;
  color: string;
  size: string;
  sku: string;
  stock: number;
  lowStockThreshold: number | null;
}

/** Editor-only image: may carry a short-lived Cloudinary delete token. */
export type EditorImage = ProductImage & { deleteToken?: string; uploadedAt?: number };

export interface ProductFormValues {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  materialCare: string;
  categoryId: string;
  collectionIds: string[];
  tags: string[];
  gender: Gender;
  price: number;
  compareAtPrice: number | null;
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  status: ProductStatus;
  images: EditorImage[];
  colors: ProductColor[];
  sizes: string[];
  variants: VariantRow[];
}

export const EMPTY_PRODUCT: ProductFormValues = {
  name: '',
  slug: '',
  shortDescription: '',
  description: '',
  materialCare: '',
  categoryId: '',
  collectionIds: [],
  tags: [],
  gender: 'unisex',
  price: 0,
  compareAtPrice: null,
  isFeatured: false,
  isNew: true,
  isBestSeller: false,
  status: 'draft',
  images: [],
  colors: [],
  sizes: [],
  variants: [],
};
