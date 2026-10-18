import { MessageSquare } from 'lucide-react';
import { formatDate, type Product } from '@areqa/shared';
import { useReviews } from '@/features/catalog/hooks';
import { Skeleton } from '@/components/ui/Skeleton';
import { Stars } from '@/components/ui/Stars';

export function ProductReviews({ productId, product }: { productId: string; product: Product }) {
  const { data: reviews = [], isLoading } = useReviews(productId);
  return (
    <section aria-labelledby="reviews-heading" className="border-line border-t py-16">
      <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
        <div>
          <h2 id="reviews-heading" className="section-title">
            Reviews
          </h2>
          {product.ratingCount > 0 ? (
            <div className="mt-4 flex items-center gap-3">
              <span className="font-display text-4xl font-bold">
                {product.ratingAvg.toFixed(1)}
              </span>
              <div>
                <Stars value={product.ratingAvg} />
                <p className="text-muted text-xs">
                  {product.ratingCount} {product.ratingCount === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted mt-4 text-sm">No reviews yet.</p>
          )}
          <p className="text-muted mt-4 text-sm">
            Bought this? Once your order is delivered you can leave a review from your account.
          </p>
        </div>
        <div>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-mist text-muted flex items-center gap-3 rounded-lg p-6 text-sm">
              <MessageSquare className="size-5 shrink-0" aria-hidden /> Be the first to share what
              you think of this piece.
            </div>
          ) : (
            <ul className="divide-line divide-y">
              {reviews.map((r) => (
                <li key={r.id} className="py-6 first:pt-0">
                  <div className="flex items-center justify-between gap-4">
                    <Stars value={r.rating} />
                    <time className="text-muted text-xs">{formatDate(r.createdAt)}</time>
                  </div>
                  {r.title && <p className="mt-3 font-semibold">{r.title}</p>}
                  <p className="mt-2 text-sm leading-relaxed">{r.body}</p>
                  <p className="text-muted mt-3 text-xs">{r.userName} · Verified buyer</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
