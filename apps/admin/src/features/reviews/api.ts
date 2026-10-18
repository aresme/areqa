import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { COL, type Review, type ReviewStatus, type WithId } from '@areqa/shared';
import { refreshIndexFor } from '@/features/catalog/indexStock';
import { requireFirebase } from '@/lib/firebase';

const db = () => requireFirebase().db;

export async function fetchReviews(): Promise<WithId<Review>[]> {
  const snap = await getDocs(query(collection(db(), COL.reviews), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Review) }));
}

/** Recomputes a product's rating from its approved reviews (the only source of truth). */
export async function recomputeRating(productId: string) {
  const snap = await getDocs(
    query(
      collection(db(), COL.reviews),
      where('productId', '==', productId),
      where('status', '==', 'approved'),
    ),
  );
  const ratings = snap.docs.map((d) => (d.data() as Review).rating);
  const ratingCount = ratings.length;
  const ratingAvg = ratingCount
    ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratingCount) * 10) / 10
    : 0;
  await updateDoc(doc(db(), COL.products, productId), { ratingAvg, ratingCount }).catch(
    () => undefined,
  ); // product may be deleted
  await refreshIndexFor([productId]);
}

export async function setReviewStatus(review: WithId<Review>, status: ReviewStatus) {
  await updateDoc(doc(db(), COL.reviews, review.id), { status });
  if (status === 'approved' || review.status === 'approved')
    await recomputeRating(review.productId);
}

export async function removeReview(review: WithId<Review>) {
  await deleteDoc(doc(db(), COL.reviews, review.id));
  if (review.status === 'approved') await recomputeRating(review.productId);
}

export const useReviewsAdmin = () =>
  useQuery({ queryKey: ['admin-reviews'], queryFn: fetchReviews });
export function useInvalidateReviews() {
  const qc = useQueryClient();
  return () => void qc.invalidateQueries({ queryKey: ['admin-reviews'] });
}
