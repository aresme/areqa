import {
  Timestamp,
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import {
  COL,
  DEFAULT_LOW_STOCK_THRESHOLD,
  DOC,
  type CatalogIndex,
  type InventoryItem,
  type Order,
  type StoreSettings,
  type WithId,
} from '@areqa/shared';
import { requireFirebase } from '@/lib/firebase';

const DAY = 86_400_000;

export interface DashboardData {
  orders: WithId<Order>[];
  pendingCount: number;
  productCount: number;
  lowStock: (InventoryItem & { name: string; threshold: number })[];
  catalog: CatalogIndex['entries'];
}

/** ~60 days of orders + a few counts. One dashboard load costs roughly (orders in window + 10) reads. */
async function fetchDashboard(): Promise<DashboardData> {
  const { db } = requireFirebase();
  const since = Timestamp.fromMillis(Date.now() - 60 * DAY);
  const settingsSnap = await getDoc(doc(db, COL.settings, DOC.storeSettings));
  const threshold =
    (settingsSnap.data() as StoreSettings | undefined)?.lowStockThreshold ??
    DEFAULT_LOW_STOCK_THRESHOLD;

  const [ordersSnap, pending, products, invSnap, catalogSnap] = await Promise.all([
    getDocs(
      query(
        collection(db, COL.orders),
        where('createdAt', '>=', since),
        orderBy('createdAt', 'desc'),
      ),
    ),
    getCountFromServer(query(collection(db, COL.orders), where('status', '==', 'pending'))),
    getCountFromServer(query(collection(db, COL.products), where('status', '==', 'active'))),
    getDocs(
      query(
        collection(db, COL.inventory),
        where('stock', '<=', Math.max(threshold, 20)),
        orderBy('stock'),
      ),
    ),
    getDoc(doc(db, COL.meta, DOC.catalogIndex)),
  ]);
  const catalog = catalogSnap.exists() ? (catalogSnap.data() as CatalogIndex).entries : [];
  const names = new Map(catalog.map((e) => [e.id, e.name]));
  const lowStock = invSnap.docs
    .map((d) => d.data() as InventoryItem)
    .map((i) => ({
      ...i,
      name: names.get(i.productId) ?? '',
      threshold: i.lowStockThreshold ?? threshold,
    }))
    // Only live products matter; per-variant thresholds override the store default.
    .filter((i) => i.name && i.stock <= i.threshold);

  return {
    orders: ordersSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Order) })),
    pendingCount: pending.data().count,
    productCount: products.data().count,
    lowStock,
    catalog,
  };
}

export const useDashboard = () =>
  useQuery({ queryKey: ['dashboard'], queryFn: fetchDashboard, staleTime: 60_000 });
