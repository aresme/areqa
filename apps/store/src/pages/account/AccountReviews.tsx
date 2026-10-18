import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { formatDate } from '@areqa/shared';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Stars } from '@/components/ui/Stars';
import { useCatalogMap } from '@/features/catalog/hooks';
import { useMyReviews } from '@/features/account/api';

const STATUS = {
  pending: 'Awaiting approval',
  approved: 'Published',
  hidden: 'Not published',
} as const;

export default function AccountReviews() {
  const { data: reviews = [], isLoading } = useMyReviews();
  const catalog = useCatalogMap();
  return (
    <section>
      <h2 className="section-title mb-6 text-2xl">Reviews</h2>
      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No reviews yet"
          body="Once an order is delivered, you can review it from your order page."
          action={
            <Link to="/account/orders" className="text-sm font-semibold underline">
              Go to orders
            </Link>
          }
        />
      ) : (
        <ul className="divide-line divide-y">
          {reviews.map((r) => {
            const product = catalog.get(r.productId);
            return (
              <li key={r.id} className="py-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link
                    to={product ? `/product/${product.slug}` : '#'}
                    className="font-semibold hover:underline"
                  >
                    {product?.name ?? 'Product'}
                  </Link>
                  <span className="text-muted text-xs">
                    {STATUS[r.status]} · {formatDate(r.createdAt)}
                  </span>
                </div>
                <Stars value={r.rating} className="mt-2" />
                {r.title && <p className="mt-2 text-sm font-medium">{r.title}</p>}
                <p className="text-muted mt-1 text-sm">{r.body}</p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
