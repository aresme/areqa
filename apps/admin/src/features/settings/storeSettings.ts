import { doc, getDoc } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { COL, DEFAULT_LOW_STOCK_THRESHOLD, DOC, type StoreSettings } from '@areqa/shared';
import type { StoreInfo } from '@areqa/shared/email';
import { config } from '@/lib/env';
import { requireFirebase } from '@/lib/firebase';

export async function fetchSettings(): Promise<StoreSettings | null> {
  const snap = await getDoc(doc(requireFirebase().db, COL.settings, DOC.storeSettings));
  return snap.exists() ? (snap.data() as StoreSettings) : null;
}

export const useStoreSettings = () =>
  useQuery({ queryKey: ['admin-settings'], queryFn: fetchSettings, staleTime: 5 * 60_000 });

export const lowStockDefault = (s: StoreSettings | null | undefined) =>
  s?.lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD;

export function storeInfoFrom(s: StoreSettings | null | undefined): StoreInfo {
  return {
    storeName: s?.storeName ?? 'Areqa',
    storeUrl: config.storeUrl,
    contactEmail: s?.contactEmail ?? '',
    phone: s?.phone ?? '',
    whatsappNumber: s?.whatsappNumber ?? '',
    pickupLocation: s?.pickupLocation ?? '',
  };
}
