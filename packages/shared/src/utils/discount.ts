import type { Discount } from '../types';
import type { KES } from '../types/common';
import { formatKES } from './money';
import { toDate } from './dates';

export type DiscountCheck = { ok: true; amount: KES } | { ok: false; reason: string };

/**
 * Mirrors `isValidDiscountFor` in firestore.rules exactly — if this says ok,
 * the order write will be accepted.
 */
export function evaluateDiscount(
  d: Discount | null,
  subtotal: KES,
  now = new Date(),
): DiscountCheck {
  if (!d || !d.isActive) return { ok: false, reason: 'This code is not valid.' };
  const start = toDate(d.startsAt);
  const end = toDate(d.endsAt);
  if (start && now < start) return { ok: false, reason: 'This code is not active yet.' };
  if (end && now >= end) return { ok: false, reason: 'This code has expired.' };
  if (d.usageLimit !== null && d.usedCount >= d.usageLimit) {
    return { ok: false, reason: 'This code has reached its usage limit.' };
  }
  if (subtotal < d.minOrder) {
    return { ok: false, reason: `Spend ${formatKES(d.minOrder)} or more to use this code.` };
  }
  const amount =
    d.type === 'percentage' ? Math.floor((subtotal * d.value) / 100) : Math.min(d.value, subtotal);
  return { ok: true, amount };
}

export const normalizeCode = (code: string) => code.trim().toUpperCase().replace(/\s+/g, '');
