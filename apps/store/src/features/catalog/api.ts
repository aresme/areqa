import { collection, doc, getDoc, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import {
  COL,
  DOC,
  type CatalogIndex,
  type CatalogIndexEntry,
  type Category,
  type Collection,
  type InventoryItem,
  type Product,
  type Review,
  type WithId,
} from '@areqa/shared';
import { requireFirebase } from '@/lib/firebase';

const db = () => requireFirebase().db;

export async function fetchCatalog(): Promise<CatalogIndexEntry[]> {
  const snap = await getDoc(doc(db(), COL.meta, DOC.catalogIndex));
  return snap.exists() ? (snap.data() as CatalogIndex).entries : [];
}

export async function fetchCategories(): Promise<WithId<Category>[]> {
  const snap = await getDocs(query(collection(db(), COL.categories), orderBy('sortOrder')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Category) })).filter((c) => c.isVisible);
}

export async function fetchCollections(): Promise<WithId<Collection>[]> {
  const snap = await getDocs(query(collection(db(), COL.collections), orderBy('sortOrder')));
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Collection) }))
    .filter((c) => c.isVisible);
}

export async function fetchProductBySlug(slug: string): Promise<WithId<Product> | null> {
  const snap = await getDocs(
    query(
      collection(db(), COL.products),
      where('status', '==', 'active'),
      where('slug', '==', slug),
      limit(1),
    ),
  );
  const d = snap.docs[0];
  return d ? { id: d.id, ...(d.data() as Product) } : null;
}

export async function fetchInventory(productId: string): Promise<Record<string, number>> {
  const snap = await getDocs(
    query(collection(db(), COL.inventory), where('productId', '==', productId)),
  );
  const stock: Record<string, number> = {};
  snap.docs.forEach((d) => {
    const item = d.data() as InventoryItem;
    stock[item.variantKey] = item.stock;
  });
  return stock;
}

export async function fetchApprovedReviews(productId: string): Promise<WithId<Review>[]> {
  const snap = await getDocs(
    query(
      collection(db(), COL.reviews),
      where('productId', '==', productId),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc'),
      limit(20),
    ),
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Review) }));
}
