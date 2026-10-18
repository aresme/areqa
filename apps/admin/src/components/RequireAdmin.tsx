import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { isOwner, useAdminAuth } from '@/features/auth/adminAuth';
import { EmptyState } from './ui/EmptyState';
import { Skeleton } from './ui/Skeleton';

export function RequireAdmin({
  children,
  ownerOnly,
}: {
  children: ReactNode;
  ownerOnly?: boolean;
}) {
  const { status, admin } = useAdminAuth();
  const location = useLocation();
  if (status === 'loading') {
    return (
      <div
        className="flex min-h-dvh items-center justify-center p-8"
        role="status"
        aria-label="Loading"
      >
        <Skeleton className="h-40 w-full max-w-md" />
      </div>
    );
  }
  if (status !== 'admin')
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  if (ownerOnly && !isOwner(admin?.role)) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Owner access only"
        body="Only the store owner can change settings and manage admins."
      />
    );
  }
  return <>{children}</>;
}
