import { collection, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import {
  COL,
  DOC,
  type DeliveryZone,
  type HomeContent,
  type PagesContent,
  type StoreSettings,
  type WithId,
} from '@areqa/shared';
import { requireFirebase } from '@/lib/firebase';

const db = () => requireFirebase().db;

export async function fetchSettings(): Promise<StoreSettings | null> {
  const snap = await getDoc(doc(db(), COL.settings, DOC.storeSettings));
  return snap.exists() ? (snap.data() as StoreSettings) : null;
}

export async function fetchHomeContent(): Promise<HomeContent | null> {
  const snap = await getDoc(doc(db(), COL.content, DOC.homeContent));
  return snap.exists() ? (snap.data() as HomeContent) : null;
}

export async function fetchPagesContent(): Promise<PagesContent | null> {
  const snap = await getDoc(doc(db(), COL.content, DOC.pagesContent));
  return snap.exists() ? (snap.data() as PagesContent) : null;
}

export async function fetchDeliveryZones(): Promise<WithId<DeliveryZone>[]> {
  const snap = await getDocs(query(collection(db(), COL.deliveryZones), orderBy('sortOrder')));
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as DeliveryZone) }))
    .filter((z) => z.isActive);
}
