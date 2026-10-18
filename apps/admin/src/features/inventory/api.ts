import { collection, doc, getDocs, serverTimestamp, writeBatch } from 'firebase/firestore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { COL, inventoryId, type InventoryItem } from '@areqa/shared';
import { refreshIndexFor } from '@/features/catalog/indexStock';
import { requireFirebase } from '@/lib/firebase';

export async function fetchInventory(): Promise<InventoryItem[]> {
  const snap = await getDocs(collection(requireFirebase().db, COL.inventory));
  return snap.docs.map((d) => d.data() as InventoryItem);
}

export const useInventoryAll = () =>
  useQuery({ queryKey: ['admin-inventory'], queryFn: fetchInventory, staleTime: 30_000 });

/**
 * Sets one variant's stock and keeps product.totalStock (sum of its variants) and the
 * storefront index in step. `siblings` are the product's other variants as currently loaded.
 */
export async function updateVariant(
  item: InventoryItem,
  patch: Partial<Pick<InventoryItem, 'stock' | 'lowStockThreshold'>>,
  siblings: InventoryItem[],
) {
  const { db } = requireFirebase();
  const b = writeBatch(db);
  b.update(doc(db, COL.inventory, inventoryId(item.productId, item.variantKey)), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
  if (patch.stock !== undefined) {
    const total = siblings.reduce(
      (n, s) => n + (s.variantKey === item.variantKey ? patch.stock! : s.stock),
      0,
    );
    b.update(doc(db, COL.products, item.productId), {
      totalStock: total,
      updatedAt: serverTimestamp(),
    });
  }
  await b.commit();
  if (patch.stock !== undefined) await refreshIndexFor([item.productId]);
}

export function useInventoryCache() {
  const qc = useQueryClient();
  return {
    patch(productId: string, variantKey: string, patch: Partial<InventoryItem>) {
      qc.setQueryData<InventoryItem[]>(['admin-inventory'], (list) =>
        list?.map((i) =>
          i.productId === productId && i.variantKey === variantKey ? { ...i, ...patch } : i,
        ),
      );
    },
    invalidateProducts: () => void qc.invalidateQueries({ queryKey: ['admin-products'] }),
  };
}
