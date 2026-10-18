import { lazy, Suspense } from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { Heart, LogOut, MapPin, Package, Star, User } from 'lucide-react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { Seo } from '@/components/Seo';
import { Skeleton } from '@/components/ui/Skeleton';
import { signOut } from '@/features/auth/authService';
import { toast } from '@/features/ui/toastStore';
import { cn } from '@/lib/cn';
import NotFoundPage from './NotFoundPage';

const Overview = lazy(() => import('./account/AccountOverview'));
const Orders = lazy(() => import('./account/AccountOrders'));
const OrderDetail = lazy(() => import('./account/AccountOrderDetail'));
const Addresses = lazy(() => import('./account/AccountAddresses'));
const Reviews = lazy(() => import('./account/AccountReviews'));

const NAV = [
  { to: '/account', label: 'Overview', icon: User, end: true },
  { to: '/account/orders', label: 'Orders', icon: Package },
  { to: '/account/addresses', label: 'Addresses', icon: MapPin },
  { to: '/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/account/reviews', label: 'Reviews', icon: Star },
];

export default function AccountPage() {
  const navigate = useNavigate();
  return (
    <RequireAuth>
      <Seo title="My account" noIndex />
      <div className="container-page pb-20 pt-8 sm:pt-12">
        <h1 className="text-display uppercase">My account</h1>
        <div className="mt-8 grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-16">
          <nav aria-label="Account" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
            <ul className="flex gap-2 lg:flex-col lg:gap-1">
              {NAV.map(({ to, label, icon: Icon, end }) => (
                <li key={to} className="shrink-0">
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive ? 'bg-mint' : 'hover:bg-mist',
                      )
                    }
                  >
                    <Icon className="size-4" aria-hidden /> {label}
                  </NavLink>
                </li>
              ))}
              <li className="shrink-0">
                <button
                  type="button"
                  onClick={async () => {
                    await signOut();
                    toast.info('Signed out');
                    navigate('/');
                  }}
                  className="text-muted hover:bg-mist hover:text-ink flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm font-medium"
                >
                  <LogOut className="size-4" aria-hidden /> Sign out
                </button>
              </li>
            </ul>
          </nav>
          <div className="min-w-0">
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <Routes>
                <Route index element={<Overview />} />
                <Route path="orders" element={<Orders />} />
                <Route path="orders/:id" element={<OrderDetail />} />
                <Route path="addresses" element={<Addresses />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
