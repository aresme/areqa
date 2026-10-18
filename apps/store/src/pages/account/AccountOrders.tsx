import { Package } from 'lucide-react';
import { OrderCard } from '@/components/account/OrderCard';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useMyOrders } from '@/features/account/api';

export default function AccountOrders() {
  const { data: orders = [], isLoading, isError, refetch } = useMyOrders();
  if (isError) return <ErrorState onRetry={() => void refetch()} />;
  return (
    <section>
      <h2 className="section-title mb-6 text-2xl">Orders</h2>
      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          body="Orders placed while signed in appear here."
          action={<ButtonLink to="/shop">Start shopping</ButtonLink>}
        />
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
      <p className="text-muted mt-6 text-sm">
        Ordered as a guest? Use{' '}
        <a href="/track" className="underline">
          order tracking
        </a>{' '}
        with your order number and phone.
      </p>
    </section>
  );
}
