import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { COL, type Order, type Review, type WithId } from '@areqa/shared';
import { requireFirebase } from '@/lib/firebase';
import { useAuth } from '@/features/auth/authStore';
import { withTimeout } from '@/lib/withTimeout';

const db = () => requireFirebase().db;

export async function fetchMyOrders(uid: string): Promise<WithId<Order>[]> {
  const snap = await getDocs(
    query(
      collection(db(), COL.orders),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(50),
    ),
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Order) }));
}

export async function fetchMyOrder(id: string): Promise<WithId<Order> | null> {
  const snap = await getDoc(doc(db(), COL.orders, id));
  return snap.exists() ? { id: snap.id, ...(snap.data() as Order) } : null;
}

export async function fetchMyReviews(uid: string): Promise<WithId<Review>[]> {
  const snap = await getDocs(
    query(
      collection(db(), COL.reviews),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(50),
    ),
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Review) }));
}

/** One review per product per order: the deterministic id makes a second attempt fail in rules. */
export const reviewId = (orderId: string, productId: string) => `${orderId}_${productId}`;

export async function submitReview(input: {
  orderId: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  body: string;
}) {
  await withTimeout(
    setDoc(doc(db(), COL.reviews, reviewId(input.orderId, input.productId)), {
      ...input,
      status: 'pending',
      createdAt: serverTimestamp(),
    }),
  );
}

export function useMyOrders() {
  const uid = useAuth((s) => s.user?.uid);
  return useQuery({
    queryKey: ['my-orders', uid],
    queryFn: () => fetchMyOrders(uid!),
    enabled: Boolean(uid),
    staleTime: 60_000,
  });
}

export function useMyOrder(id: string | undefined) {
  const uid = useAuth((s) => s.user?.uid);
  return useQuery({
    queryKey: ['my-order', uid, id],
    queryFn: () => fetchMyOrder(id!),
    enabled: Boolean(uid && id),
    staleTime: 60_000,
  });
}

export function useMyReviews() {
  const uid = useAuth((s) => s.user?.uid);
  return useQuery({
    queryKey: ['my-reviews', uid],
    queryFn: () => fetchMyReviews(uid!),
    enabled: Boolean(uid),
  });
}

export function useInvalidateMyData() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: ['my-reviews'] });
    void qc.invalidateQueries({ queryKey: ['my-orders'] });
  };
}
