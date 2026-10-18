import { useEffect, useState } from 'react';
import {
  Timestamp,
  arrayUnion,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  type DocumentReference,
} from 'firebase/firestore';
import {
  COL,
  ORDER_TRANSITIONS,
  inventoryId,
  type Discount,
  type InventoryItem,
  type Order,
  type OrderStatus,
  type Product,
  type StoreSettings,
  type WithId,
} from '@areqa/shared';
import { sendEmail, statusUpdateEmail } from '@areqa/shared/email';
import { refreshIndexFor } from '@/features/catalog/indexStock';
import { storeInfoFrom } from '@/features/settings/storeSettings';
import { config } from '@/lib/env';
import { requireFirebase } from '@/lib/firebase';

const db = () => requireFirebase().db;

interface LiveState<T> {
  data: T;
  loading: boolean;
  error: Error | null;
}

/** Real-time order list — the admin is the only place we pay for live listeners. */
export function useOrdersLive(max = 300): LiveState<WithId<Order>[]> {
  const [state, setState] = useState<LiveState<WithId<Order>[]>>({
    data: [],
    loading: true,
    error: null,
  });
  useEffect(
    () =>
      onSnapshot(
        query(collection(db(), COL.orders), orderBy('createdAt', 'desc'), limit(max)),
        (snap) =>
          setState({
            data: snap.docs.map((d) => ({ id: d.id, ...(d.data() as Order) })),
            loading: false,
            error: null,
          }),
        (error) => setState((s) => ({ ...s, loading: false, error })),
      ),
    [max],
  );
  return state;
}

export function useOrderLive(id: string | undefined): LiveState<WithId<Order> | null> {
  const [state, setState] = useState<LiveState<WithId<Order> | null>>({
    data: null,
    loading: true,
    error: null,
  });
  useEffect(() => {
    if (!id) return;
    return onSnapshot(
      doc(db(), COL.orders, id),
      (snap) =>
        setState({
          data: snap.exists() ? { id: snap.id, ...(snap.data() as Order) } : null,
          loading: false,
          error: null,
        }),
      (error) => setState({ data: null, loading: false, error }),
    );
  }, [id]);
  return state;
}

export class TransitionError extends Error {}

function assertTransition(from: OrderStatus, to: OrderStatus) {
  if (!ORDER_TRANSITIONS[from].includes(to))
    throw new TransitionError(
      `An order that is ${from.replace(/_/g, ' ')} cannot be moved to ${to.replace(/_/g, ' ')}.`,
    );
}

export interface StatusChangeResult {
  emailed: boolean;
  emailReason?: string;
}

/**
 * Moves an order forward (or cancels it). Cancelling returns stock to each variant,
 * reverses sales counts and releases the discount use — all in one transaction.
 */
export async function changeStatus(
  order: WithId<Order>,
  to: OrderStatus,
  adminUid: string,
  settings: StoreSettings | null,
  opts: { note?: string; notify?: boolean } = {},
): Promise<StatusChangeResult> {
  assertTransition(order.status, to);
  const at = Timestamp.now();
  const event = { status: to, at, by: adminUid, ...(opts.note ? { note: opts.note } : {}) };
  const orderRef = doc(db(), COL.orders, order.id);
  const lookupRef = doc(db(), COL.orderLookup, order.lookupId);

  await runTransaction(db(), async (tx) => {
    const fresh = await tx.get(orderRef);
    if (!fresh.exists()) throw new Error('Order not found');
    const current = fresh.data() as Order;
    assertTransition(current.status, to);

    if (to === 'cancelled') {
      const invRefs = current.items.map(
        (i) =>
          doc(
            db(),
            COL.inventory,
            inventoryId(i.productId, i.variantKey),
          ) as DocumentReference<InventoryItem>,
      );
      const productIds = [...new Set(current.items.map((i) => i.productId))];
      const productRefs = productIds.map(
        (id) => doc(db(), COL.products, id) as DocumentReference<Product>,
      );
      const discountRef = current.discount
        ? (doc(db(), COL.discounts, current.discount.code) as DocumentReference<Discount>)
        : null;
      const [invSnaps, productSnaps, discountSnap] = await Promise.all([
        Promise.all(invRefs.map((r) => tx.get(r))),
        Promise.all(productRefs.map((r) => tx.get(r))),
        discountRef ? tx.get(discountRef) : Promise.resolve(null),
      ]);
      // Variants or products deleted since the order was placed are skipped.
      current.items.forEach((item, i) => {
        const snap = invSnaps[i]!;
        if (snap.exists())
          tx.update(invRefs[i]!, {
            stock: snap.data().stock + item.qty,
            updatedAt: serverTimestamp(),
          });
      });
      productIds.forEach((id, i) => {
        const snap = productSnaps[i]!;
        if (!snap.exists()) return;
        const qty = current.items.filter((x) => x.productId === id).reduce((n, x) => n + x.qty, 0);
        tx.update(productRefs[i]!, {
          totalStock: snap.data().totalStock + qty,
          salesCount: Math.max(0, snap.data().salesCount - qty),
        });
      });
      if (discountRef && discountSnap?.exists())
        tx.update(discountRef, { usedCount: Math.max(0, discountSnap.data().usedCount - 1) });
    }

    tx.update(orderRef, {
      status: to,
      statusHistory: arrayUnion(event),
      updatedAt: serverTimestamp(),
    });
    tx.update(lookupRef, { status: to, statusHistory: arrayUnion({ status: to, at }) });
  });

  // Keep storefront listings' stock honest (see refreshIndexFor).
  if (to === 'confirmed' || to === 'cancelled')
    refreshIndexFor(order.productIds).catch((e) =>
      console.warn('[orders] index refresh failed', e),
    );

  if (opts.notify === false) return { emailed: false, emailReason: 'Skipped' };
  const { publicKey, serviceId, templateCustomer } = config.emailjs;
  const res = await sendEmail(
    { publicKey, serviceId, templateId: templateCustomer },
    statusUpdateEmail(order, to, storeInfoFrom(settings), opts.note),
  );
  return res.sent ? { emailed: true } : { emailed: false, emailReason: res.reason };
}

export async function recordPayment(orderId: string, method: string, ref: string) {
  await updateDoc(doc(db(), COL.orders, orderId), {
    paymentStatus: 'paid',
    paymentRef: `${method}${ref ? `: ${ref.trim().toUpperCase()}` : ''}`,
    paidAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function markUnpaid(orderId: string) {
  await updateDoc(doc(db(), COL.orders, orderId), {
    paymentStatus: 'unpaid',
    paymentRef: null,
    paidAt: null,
    updatedAt: serverTimestamp(),
  });
}

export async function saveAdminNotes(orderId: string, notes: string) {
  await updateDoc(doc(db(), COL.orders, orderId), {
    adminNotes: notes,
    updatedAt: serverTimestamp(),
  });
}

/** Lines whose price differs from the product's current price (rules cannot check this). */
export function priceMismatches(
  order: Order,
  livePrice: (productId: string) => number | undefined,
) {
  return order.items
    .map((i) => ({ item: i, live: livePrice(i.productId) }))
    .filter((x) => x.live !== undefined && x.live !== x.item.unitPrice);
}
