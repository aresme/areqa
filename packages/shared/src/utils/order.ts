import { nairobiDateStamp } from './dates';
import { normalizeKenyanPhone } from './phone';

/** ORD-20261018-4821 */
export function generateOrderNumber(date = new Date()): string {
  const rand = crypto.getRandomValues(new Uint32Array(1))[0]! % 10000;
  return `ORD-${nairobiDateStamp(date)}-${String(rand).padStart(4, '0')}`;
}

export function isOrderNumber(value: string): boolean {
  return /^ORD-\d{8}-\d{4}$/.test(value.trim().toUpperCase());
}

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Doc id for `orderLookup`: knowing the order number alone is not enough to read status. */
export async function orderLookupId(orderNumber: string, phone: string): Promise<string> {
  const normalized = normalizeKenyanPhone(phone);
  return `${orderNumber.trim().toUpperCase()}__${await sha256Hex(normalized)}`;
}
