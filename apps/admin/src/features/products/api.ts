import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
  type WriteBatch,
} from 'firebase/firestore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  COL,
  buildSearchKeywords,
  inventoryId,
  type Category,
  type InventoryItem,
  type Product,
  type WithId,
} from '@areqa/shared';
import { requireFirebase } from '@/lib/firebase';
import { syncCatalogIndex } from '@/features/catalog/catalogIndex';
import type { ProductFormValues, VariantRow } from './types';

const db = () => requireFirebase().db;

export async function fetchProducts(): Promise<WithId<Product>[]> {
  const snap = await getDocs(query(collection(db(), COL.products), orderBy('updatedAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Product) }));
}

export async function fetchProduct(
  id: string,
): Promise<{ product: WithId<Product>; inventory: InventoryItem[] } | null> {
  const [p, inv] = await Promise.all([
    getDoc(doc(db(), COL.products, id)),
    getDocs(query(collection(db(), COL.inventory), where('productId', '==', id))),
  ]);
  if (!p.exists()) return null;
  return {
    product: { id: p.id, ...(p.data() as Product) },
    inventory: inv.docs.map((d) => d.data() as InventoryItem),
  };
}

async function categoryNameOf(categoryId: string): Promise<string> {
  const snap = await getDoc(doc(db(), COL.categories, categoryId));
  return snap.exists() ? (snap.data() as Category).name : '';
}

/** Batches respect Firestore's 500-op limit. */
async function commitInChunks(ops: ((b: WriteBatch) => void)[]) {
  for (let i = 0; i < ops.length; i += 450) {
    const b = writeBatch(db());
    ops.slice(i, i + 450).forEach((op) => op(b));
    await b.commit();
  }
}

export class SlugTakenError extends Error {}

/**
 * Creates or updates a product, its per-variant inventory docs and its catalog index entry.
 * Sales/rating counters are never touched here (checkout and review moderation own them).
 */
export async function saveProduct(id: string | null, v: ProductFormValues): Promise<string> {
  const productId = id ?? v.slug;
  const ref = doc(db(), COL.products, productId);
  const existingSnap = await getDoc(ref);
  if (!id && existingSnap.exists())
    throw new SlugTakenError(`A product with the URL "${v.slug}" already exists.`);
  const existing = existingSnap.exists() ? (existingSnap.data() as Product) : null;

  const prevInv = id
    ? await getDocs(query(collection(db(), COL.inventory), where('productId', '==', productId)))
    : null;
  const prevKeys = new Map(
    prevInv?.docs.map((d) => [(d.data() as InventoryItem).variantKey, d.data() as InventoryItem]) ??
      [],
  );

  const categoryName = await categoryNameOf(v.categoryId);
  const totalStock = v.variants.reduce((n, r) => n + Math.max(0, Math.floor(r.stock)), 0);
  const compareAt =
    v.compareAtPrice && v.compareAtPrice > v.price ? Math.round(v.compareAtPrice) : null;

  const product: Omit<Product, 'createdAt' | 'updatedAt'> = {
    name: v.name.trim(),
    slug: v.slug,
    description: v.description.trim(),
    shortDescription: v.shortDescription.trim(),
    materialCare: v.materialCare.trim(),
    categoryId: v.categoryId,
    collectionIds: v.collectionIds,
    tags: v.tags,
    searchKeywords: buildSearchKeywords(
      v.name,
      v.tags,
      categoryName,
      v.gender,
      v.colors.map((c) => c.name),
    ),
    gender: v.gender,
    price: Math.round(v.price),
    compareAtPrice: compareAt,
    images: v.images.map(({ deleteToken: _t, uploadedAt: _u, ...img }) => img),
    colors: v.colors,
    colorNames: v.colors.map((c) => c.name),
    sizes: v.sizes,
    variants: v.variants.map(({ key, color, size, sku }) => ({
      key,
      color,
      size,
      ...(sku ? { sku } : {}),
    })),
    totalStock,
    isFeatured: v.isFeatured,
    isNew: v.isNew,
    isBestSeller: v.isBestSeller,
    isOnSale: compareAt !== null,
    status: v.status,
    salesCount: existing?.salesCount ?? 0,
    ratingAvg: existing?.ratingAvg ?? 0,
    ratingCount: existing?.ratingCount ?? 0,
    lastOrderId: existing?.lastOrderId ?? null,
  };

  const ops: ((b: WriteBatch) => void)[] = [
    (b) =>
      b.set(ref, {
        ...product,
        createdAt: existing?.createdAt ?? serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
  ];
  for (const row of v.variants)
    ops.push((b) =>
      b.set(
        doc(db(), COL.inventory, inventoryId(productId, row.key)),
        inventoryDoc(productId, row, prevKeys.get(row.key)),
      ),
    );
  for (const key of prevKeys.keys()) {
    if (!v.variants.some((r) => r.key === key))
      ops.push((b) => b.delete(doc(db(), COL.inventory, inventoryId(productId, key))));
  }
  await commitInChunks(ops);
  await syncCatalogIndex([
    {
      id: productId,
      product: { ...product, createdAt: existing?.createdAt ?? new Date(), updatedAt: new Date() },
      categoryName,
    },
  ]);
  return productId;
}

function inventoryDoc(productId: string, row: VariantRow, prev?: InventoryItem) {
  return {
    productId,
    variantKey: row.key,
    color: row.color,
    size: row.size,
    sku: row.sku,
    stock: Math.max(0, Math.floor(row.stock)),
    lowStockThreshold: row.lowStockThreshold,
    lastOrderId: prev?.lastOrderId ?? null,
    updatedAt: serverTimestamp(),
  };
}

export async function setProductsStatus(ids: string[], status: Product['status']) {
  const products = await Promise.all(ids.map((id) => getDoc(doc(db(), COL.products, id))));
  await commitInChunks(
    ids.map(
      (id) => (b) =>
        b.update(doc(db(), COL.products, id), { status, updatedAt: serverTimestamp() }),
    ),
  );
  const names = await Promise.all(
    products.map((p) => (p.exists() ? categoryNameOf((p.data() as Product).categoryId) : '')),
  );
  await syncCatalogIndex(
    products
      .filter((p) => p.exists())
      .map((p, i) => ({
        id: p.id,
        product: { ...(p.data() as Product), status },
        categoryName: names[i],
      })),
  );
}

export async function deleteProducts(ids: string[]) {
  const invSnaps = await Promise.all(
    ids.map((id) => getDocs(query(collection(db(), COL.inventory), where('productId', '==', id)))),
  );
  const ops: ((b: WriteBatch) => void)[] = ids.map(
    (id) => (b) => b.delete(doc(db(), COL.products, id)),
  );
  invSnaps.forEach((s) => s.docs.forEach((d) => ops.push((b) => b.delete(d.ref))));
  await commitInChunks(ops);
  await syncCatalogIndex(ids.map((id) => ({ id, product: null })));
}

/** Copies a product as a draft with zero stock and a fresh slug. */
export async function duplicateProduct(id: string): Promise<string> {
  const data = await fetchProduct(id);
  if (!data) throw new Error('Product not found');
  let slug = `${data.product.slug}-copy`;
  for (let n = 2; (await getDoc(doc(db(), COL.products, slug))).exists(); n++)
    slug = `${data.product.slug}-copy-${n}`;
  const p = data.product;
  return saveProduct(null, {
    name: `${p.name} (copy)`,
    slug,
    shortDescription: p.shortDescription,
    description: p.description,
    materialCare: p.materialCare,
    categoryId: p.categoryId,
    collectionIds: p.collectionIds,
    tags: p.tags,
    gender: p.gender,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    isFeatured: false,
    isNew: p.isNew,
    isBestSeller: false,
    status: 'draft',
    images: p.images,
    colors: p.colors,
    sizes: p.sizes,
    variants: p.variants.map((v) => ({
      key: v.key,
      color: v.color,
      size: v.size,
      sku: '',
      stock: 0,
      lowStockThreshold: null,
    })),
  });
}

export const useProducts = () => useQuery({ queryKey: ['admin-products'], queryFn: fetchProducts });
export const useProduct = (id: string | undefined) =>
  useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => fetchProduct(id!),
    enabled: Boolean(id),
  });

export function useInvalidateProducts() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: ['admin-products'] });
    void qc.invalidateQueries({ queryKey: ['admin-product'] });
  };
}
