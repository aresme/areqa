import type { Address } from '@areqa/shared';
import { updateUserDoc } from '@/features/auth/authService';
import { withTimeout } from '@/lib/withTimeout';

export const MAX_ADDRESSES = 10;

export function newAddressId() {
  return crypto.getRandomValues(new Uint32Array(2)).join('').slice(0, 12);
}

/** Upsert; making one default clears the flag on the others. The first address is always default. */
export function upsertAddress(list: Address[], address: Address): Address[] {
  let next = list.some((a) => a.id === address.id)
    ? list.map((a) => (a.id === address.id ? address : a))
    : [...list, address];
  if (address.isDefault || next.length === 1)
    next = next.map((a) => ({ ...a, isDefault: a.id === address.id }));
  return next.slice(0, MAX_ADDRESSES);
}

export function removeAddress(list: Address[], id: string): Address[] {
  const next = list.filter((a) => a.id !== id);
  if (next.length > 0 && !next.some((a) => a.isDefault)) next[0] = { ...next[0]!, isDefault: true };
  return next;
}

export const saveAddresses = (uid: string, addresses: Address[]) =>
  withTimeout(updateUserDoc(uid, { addresses }));

export const defaultAddress = (list: Address[] | undefined) =>
  list?.find((a) => a.isDefault) ?? list?.[0] ?? null;
