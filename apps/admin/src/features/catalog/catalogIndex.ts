import { doc, runTransaction } from 'firebase/firestore';
import { COL, DOC, toCatalogEntry, type CatalogIndex, type Product } from '@areqa/shared';
import { requireFirebase } from '@/lib/firebase';

/**
 * Keeps meta/catalogIndex (the storefront's single-read product index) in sync.
 * Active products are upserted; drafts and deleted products are removed.
 */
export async function syncCatalogIndex(
  changes: { id: string; product: Product | null; categoryName?: string }[],
) {
  const { db } = requireFirebase();
  const ref = doc(db, COL.meta, DOC.catalogIndex);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const entries = new Map(
      (snap.exists() ? (snap.data() as CatalogIndex).entries : []).map((e) => [e.id, e]),
    );
    for (const { id, product, categoryName } of changes) {
      if (product && product.status === 'active')
        entries.set(id, toCatalogEntry(id, product, categoryName));
      else entries.delete(id);
    }
    tx.set(ref, { entries: [...entries.values()], updatedAt: new Date() });
  });
}
