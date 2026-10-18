import { doc, getDoc } from 'firebase/firestore';
import { COL, type Category, type Product } from '@areqa/shared';
import { requireFirebase } from '@/lib/firebase';
import { syncCatalogIndex } from './catalogIndex';

/**
 * Checkout lowers product.totalStock but cannot touch meta/catalogIndex (rules budget),
 * so the storefront listing's stock is refreshed whenever an admin acts on an order.
 */
export async function refreshIndexFor(productIds: string[]) {
  const { db } = requireFirebase();
  const unique = [...new Set(productIds)];
  const changes = await Promise.all(
    unique.map(async (id) => {
      const snap = await getDoc(doc(db, COL.products, id));
      if (!snap.exists()) return { id, product: null };
      const product = snap.data() as Product;
      const cat = await getDoc(doc(db, COL.categories, product.categoryId));
      return { id, product, categoryName: cat.exists() ? (cat.data() as Category).name : '' };
    }),
  );
  await syncCatalogIndex(changes);
}
