import { doc, getDoc } from 'firebase/firestore';
import {
  COL,
  isOrderNumber,
  isValidKenyanPhone,
  orderLookupId,
  type OrderLookup,
} from '@areqa/shared';
import { requireFirebase } from '@/lib/firebase';

export type TrackResult = { ok: true; order: OrderLookup } | { ok: false; reason: string };

/** Looks up public order status. The doc id needs both the number and the phone (hashed). */
export async function trackOrder(orderNumber: string, phone: string): Promise<TrackResult> {
  const number = orderNumber.trim().toUpperCase();
  if (!isOrderNumber(number))
    return { ok: false, reason: 'Order numbers look like ORD-20261018-4821.' };
  if (!isValidKenyanPhone(phone))
    return { ok: false, reason: 'Enter the phone number you used at checkout.' };
  const snap = await getDoc(
    doc(requireFirebase().db, COL.orderLookup, await orderLookupId(number, phone)),
  );
  if (!snap.exists())
    return {
      ok: false,
      reason: 'We could not find an order with that number and phone. Check both and try again.',
    };
  return { ok: true, order: snap.data() as OrderLookup };
}
