import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, EyeOff, Star, Trash2 } from 'lucide-react';
import { formatDate, type Review, type ReviewStatus, type WithId } from '@areqa/shared';
import { PageHeader } from '@/components/PageHeader';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusPill, type PillTone } from '@/components/ui/StatusPill';
import { useProducts } from '@/features/products/api';
import {
  removeReview,
  setReviewStatus,
  useInvalidateReviews,
  useReviewsAdmin,
} from '@/features/reviews/api';
import { toast } from '@/features/ui/toastStore';
import { cn } from '@/lib/cn';

const TONE: Record<ReviewStatus, PillTone> = {
  pending: 'warn',
  approved: 'mint',
  hidden: 'outline',
};

function StarsRow({ value }: { value: number }) {
  return (
    <span className="inline-flex" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn('size-3.5', n <= value ? 'fill-ink text-ink' : 'text-line')}
          aria-hidden
        />
      ))}
    </span>
  );
}

export default function ReviewsPage() {
  const { data = [], isLoading } = useReviewsAdmin();
  const { data: products = [] } = useProducts();
  const invalidate = useInvalidateReviews();
  const [filter, setFilter] = useState<ReviewStatus | 'all'>('pending');
  const [deleting, setDeleting] = useState<WithId<Review> | null>(null);
  const names = useMemo(() => new Map(products.map((p) => [p.id, p.name])), [products]);
  const rows = data.filter((r) => filter === 'all' || r.status === filter);
  const count = (s: ReviewStatus) => data.filter((r) => r.status === s).length;

  const act = async (r: WithId<Review>, status: ReviewStatus) => {
    await setReviewStatus(r, status);
    invalidate();
    toast.success(status === 'approved' ? 'Review published' : 'Review hidden', {
      description: 'Product rating updated.',
    });
  };

  return (
    <>
      <PageHeader
        title="Reviews"
        description="Only customers with a delivered order can review. Nothing appears on the store until you approve it."
      />
      <div className="mb-4 flex gap-1" role="tablist">
        {(['pending', 'approved', 'hidden', 'all'] as const).map((s) => (
          <button
            key={s}
            role="tab"
            aria-selected={filter === s}
            onClick={() => setFilter(s)}
            className={cn(
              'rounded px-3 py-2 text-sm font-medium capitalize',
              filter === s ? 'bg-ink text-paper' : 'bg-paper text-muted hover:text-ink',
            )}
          >
            {s} {s !== 'all' && <span className="ml-1 opacity-70">{count(s)}</span>}
          </button>
        ))}
      </div>
      {isLoading ? (
        <Skeleton className="h-64" />
      ) : rows.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Star}
            title={filter === 'pending' ? 'All caught up' : 'No reviews here'}
            body={
              filter === 'pending'
                ? 'New reviews waiting for approval will appear here.'
                : undefined
            }
          />
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StarsRow value={r.rating} />
                    <StatusPill tone={TONE[r.status]}>{r.status}</StatusPill>
                  </div>
                  <p className="mt-1 text-sm">
                    <Link to={`/products/${r.productId}`} className="font-semibold hover:underline">
                      {names.get(r.productId) ?? 'Deleted product'}
                    </Link>
                    <span className="text-muted">
                      {' '}
                      · {r.userName} · {formatDate(r.createdAt)} ·{' '}
                      <Link to={`/orders/${r.orderId}`} className="underline">
                        order
                      </Link>
                    </span>
                  </p>
                </div>
                <div className="flex gap-1">
                  {r.status !== 'approved' && (
                    <button
                      onClick={() => void act(r, 'approved')}
                      className="bg-ink text-paper hover:bg-mint hover:text-ink flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold uppercase"
                    >
                      <Check className="size-3.5" /> Approve
                    </button>
                  )}
                  {r.status !== 'hidden' && (
                    <button
                      onClick={() => void act(r, 'hidden')}
                      className="border-line hover:border-ink flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs font-semibold uppercase"
                    >
                      <EyeOff className="size-3.5" /> Hide
                    </button>
                  )}
                  <button
                    onClick={() => setDeleting(r)}
                    aria-label="Delete review"
                    className="text-danger-deep hover:bg-danger/10 rounded p-2"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              {r.title && <p className="mt-3 font-semibold">{r.title}</p>}
              <p className="mt-1 text-sm leading-relaxed">{r.body}</p>
            </li>
          ))}
        </ul>
      )}
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        danger
        title="Delete this review?"
        body="It is removed permanently and the product rating is recalculated. To keep it but hide it from the store, use Hide instead."
        confirmLabel="Delete"
        onConfirm={async () => {
          await removeReview(deleting!);
          invalidate();
          toast.success('Review deleted');
        }}
      />
    </>
  );
}
