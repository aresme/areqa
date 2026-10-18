import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { formatKenyanPhone, isValidKenyanPhone, normalizeKenyanPhone } from '@areqa/shared';
import { OrderCard } from '@/components/account/OrderCard';
import { Field, Input } from '@/components/form/Field';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useMyOrders } from '@/features/account/api';
import { resetPassword, updateUserDoc } from '@/features/auth/authService';
import { useAuth } from '@/features/auth/authStore';
import { toast } from '@/features/ui/toastStore';
import { withTimeout } from '@/lib/withTimeout';

function ProfileForm() {
  const { user, profile } = useAuth();
  const [name, setName] = useState(profile?.displayName ?? '');
  const [phone, setPhone] = useState(profile?.phone ? formatKenyanPhone(profile.phone) : '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return setError('Enter your name.');
    if (phone && !isValidKenyanPhone(phone))
      return setError('Use a Kenyan number like 0712 345 678.');
    setError('');
    setBusy(true);
    try {
      await withTimeout(
        updateUserDoc(user!.uid, {
          displayName: name.trim(),
          phone: phone ? normalizeKenyanPhone(phone) : '',
        }),
      );
      toast.success('Profile saved');
    } catch {
      setError('Could not save. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
      <Field label="Name">
        {(a) => (
          <Input
            {...a}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        )}
      </Field>
      <Field label="Phone" optional>
        {(a) => (
          <Input
            {...a}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            autoComplete="tel"
          />
        )}
      </Field>
      <Field label="Email" hint="Contact us to change your email." className="sm:col-span-2">
        {(a) => <Input {...a} value={user?.email ?? ''} disabled />}
      </Field>
      {error && (
        <p role="alert" className="text-danger-deep text-sm sm:col-span-2">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Save changes'}
        </Button>
        {user?.providers.includes('password') && (
          <button
            type="button"
            className="text-sm underline underline-offset-4"
            onClick={async () => {
              await resetPassword(user.email);
              toast.success('Password reset email sent', { description: user.email });
            }}
          >
            Change password
          </button>
        )}
      </div>
    </form>
  );
}

export default function AccountOverview() {
  const { profile } = useAuth();
  const { data: orders = [], isLoading } = useMyOrders();
  return (
    <div className="space-y-12">
      <section>
        <h2 className="section-title text-2xl">
          Hello, {profile?.displayName.split(' ')[0] || 'there'}
        </h2>
        <p className="text-muted mt-1 text-sm">Manage your details, orders and addresses.</p>
      </section>
      <section aria-labelledby="recent-orders">
        <div className="mb-4 flex items-baseline justify-between">
          <h3 id="recent-orders" className="label">
            Recent orders
          </h3>
          {orders.length > 3 && (
            <Link to="/account/orders" className="text-sm underline underline-offset-4">
              View all
            </Link>
          )}
        </div>
        {isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No orders yet"
            body="When you place an order while signed in, it will show up here."
          />
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 3).map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
        )}
      </section>
      <section aria-labelledby="profile-title">
        <h3 id="profile-title" className="label mb-4">
          Profile
        </h3>
        {profile && <ProfileForm key={profile.displayName + profile.phone} />}
      </section>
    </div>
  );
}
