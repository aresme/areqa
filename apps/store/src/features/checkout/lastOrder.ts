import type { PlacedOrder } from '@areqa/shared/services';

const KEY = 'areqa-last-order';

/** Guests cannot read their order back from Firestore, so the confirmation page uses this copy. */
export function saveLastOrder(order: PlacedOrder) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(order));
  } catch {
    /* storage unavailable: confirmation page falls back to a generic message */
  }
}

export function loadLastOrder(orderNumber?: string): PlacedOrder | null {
  try {
    const order = JSON.parse(sessionStorage.getItem(KEY) ?? 'null') as PlacedOrder | null;
    return order && (!orderNumber || order.orderNumber === orderNumber) ? order : null;
  } catch {
    return null;
  }
}
