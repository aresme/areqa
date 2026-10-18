import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { COL, normalizeCode, toDate, type Discount } from '@areqa/shared';
import { requireFirebase } from '@/lib/firebase';

const db = () => requireFirebase().db;

export async function fetchDiscounts(): Promise<Discount[]> {
  const snap = await getDocs(collection(db(), COL.discounts));
  return snap.docs
    .map((d) => d.data() as Discount)
    .sort((a, b) => (toDate(b.startsAt)?.getTime() ?? 0) - (toDate(a.startsAt)?.getTime() ?? 0));
}

export interface DiscountForm {
  code: string;
  type: Discount['type'];
  value: number;
  minOrder: number;
  startsAt: string; // yyyy-mm-dd
  endsAt: string;
  usageLimit: number | null;
  isActive: boolean;
}

export class CodeTakenError extends Error {}

/** Doc id is the uppercase code; checkout reads it with a single get(). */
export async function saveDiscount(form: DiscountForm, existing: Discount | null) {
  const code = normalizeCode(form.code);
  const ref = doc(db(), COL.discounts, code);
  if (!existing && (await getDoc(ref)).exists())
    throw new CodeTakenError(`The code ${code} already exists.`);
  const data: Discount = {
    code,
    type: form.type,
    value: Math.round(form.value),
    minOrder: Math.max(0, Math.round(form.minOrder)),
    startsAt: Timestamp.fromDate(new Date(`${form.startsAt}T00:00:00`)),
    endsAt: Timestamp.fromDate(new Date(`${form.endsAt}T23:59:59`)),
    usageLimit: form.usageLimit && form.usageLimit > 0 ? Math.floor(form.usageLimit) : null,
    usedCount: existing?.usedCount ?? 0,
    isActive: form.isActive,
    lastOrderId: existing?.lastOrderId ?? null,
  };
  await setDoc(ref, data);
}

export const setDiscountActive = (code: string, isActive: boolean) =>
  updateDoc(doc(db(), COL.discounts, code), { isActive });
export const deleteDiscount = (code: string) => deleteDoc(doc(db(), COL.discounts, code));

export const useDiscounts = () =>
  useQuery({ queryKey: ['admin-discounts'], queryFn: fetchDiscounts });
export function useInvalidateDiscounts() {
  const qc = useQueryClient();
  return () => void qc.invalidateQueries({ queryKey: ['admin-discounts'] });
}

export function discountState(
  d: Discount,
  now = new Date(),
): 'active' | 'scheduled' | 'expired' | 'used up' | 'off' {
  if (!d.isActive) return 'off';
  if ((toDate(d.endsAt)?.getTime() ?? Infinity) <= now.getTime()) return 'expired';
  if ((toDate(d.startsAt)?.getTime() ?? 0) > now.getTime()) return 'scheduled';
  if (d.usageLimit !== null && d.usedCount >= d.usageLimit) return 'used up';
  return 'active';
}
