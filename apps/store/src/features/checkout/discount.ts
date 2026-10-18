import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  COL,
  evaluateDiscount,
  normalizeCode,
  type Discount,
  type DiscountCheck,
} from '@areqa/shared';
import { requireFirebase } from '@/lib/firebase';

interface DiscountState {
  code: string | null;
  apply: (code: string) => void;
  clear: () => void;
}

/** The code the customer applied in the cart; re-validated at checkout and in the transaction. */
export const useAppliedDiscount = create<DiscountState>()(
  persist(
    (set) => ({
      code: null,
      apply: (code) => set({ code: normalizeCode(code) || null }),
      clear: () => set({ code: null }),
    }),
    { name: 'areqa-discount', version: 1 },
  ),
);

export async function fetchDiscount(code: string): Promise<Discount | null> {
  try {
    const snap = await getDoc(doc(requireFirebase().db, COL.discounts, normalizeCode(code)));
    return snap.exists() ? (snap.data() as Discount) : null;
  } catch {
    return null;
  }
}

export function useDiscountCheck(
  code: string | null,
  subtotal: number,
): { check: DiscountCheck | null; loading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: ['discount', code],
    queryFn: () => fetchDiscount(code!),
    enabled: Boolean(code),
    staleTime: 60_000,
  });
  if (!code) return { check: null, loading: false };
  if (isLoading) return { check: null, loading: true };
  return { check: evaluateDiscount(data ?? null, subtotal), loading: false };
}
