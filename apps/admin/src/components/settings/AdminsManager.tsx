import { useMemo, useState } from 'react';
import { ShieldCheck, Trash2, UserPlus } from 'lucide-react';
import type { AdminRole } from '@areqa/shared';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusPill } from '@/components/ui/StatusPill';
import { useAdminAuth } from '@/features/auth/adminAuth';
import { removeAdmin, setAdmin, useAdmins, useInvalidate, useUsers } from '@/features/settings/api';
import { toast } from '@/features/ui/toastStore';

export function AdminsManager() {
  const me = useAdminAuth((s) => s.uid);
  const { data: admins = [], isLoading } = useAdmins();
  const { data: users = [] } = useUsers();
  const invalidate = useInvalidate();
  const [adding, setAdding] = useState(false);
  const [q, setQ] = useState('');
  const [role, setRole] = useState<AdminRole>('staff');
  const [removing, setRemoving] = useState<string | null>(null);
  const adminIds = useMemo(() => new Set(admins.map((a) => a.id)), [admins]);
  const candidates = useMemo(
    () =>
      users
        .filter(
          (u) =>
            !adminIds.has(u.id) &&
            (u.email.includes(q.toLowerCase()) ||
              u.displayName.toLowerCase().includes(q.toLowerCase())),
        )
        .slice(0, 8),
    [users, q, adminIds],
  );
  const owners = admins.filter((a) => a.role === 'owner').length;

  return (
    <section className="card">
      <div className="border-line flex items-center justify-between border-b p-4">
        <div>
          <h2 className="text-base uppercase">Admin users</h2>
          <p className="text-muted text-xs">
            Staff manage products and orders; only owners change settings and admins.
          </p>
        </div>
        <Button size="sm" onClick={() => setAdding(true)}>
          <UserPlus className="size-4" /> Add admin
        </Button>
      </div>
      {isLoading ? (
        <Skeleton className="m-4 h-24" />
      ) : (
        <ul className="divide-line divide-y">
          {admins.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-4 p-4">
              <ShieldCheck className="text-mint-deep size-5" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {a.name}
                  {a.id === me && <span className="text-muted ml-2 text-xs">(you)</span>}
                </p>
                <p className="text-muted text-xs">{a.email}</p>
              </div>
              <select
                value={a.role}
                disabled={a.id === me}
                aria-label={`Role for ${a.name}`}
                onChange={async (e) => {
                  await setAdmin(a.id, { ...a, role: e.target.value as AdminRole });
                  invalidate('admin-admins');
                  toast.success('Role updated');
                }}
                className="border-line bg-paper h-9 rounded border px-2 text-sm"
              >
                <option value="staff">Staff</option>
                <option value="owner">Owner</option>
              </select>
              {a.id !== me && (
                <button
                  aria-label={`Remove ${a.name}`}
                  onClick={() => setRemoving(a.id)}
                  className="text-danger-deep hover:bg-danger/10 rounded p-2"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      <Modal open={adding} onClose={() => setAdding(false)} title="Add an admin">
        <p className="text-muted mb-4 text-sm">
          The person first creates a normal account on the store (Sign in → Create account). Then
          find them here.
        </p>
        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or email"
            aria-label="Search accounts"
            className="border-line h-10 flex-1 rounded border px-3 text-sm"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as AdminRole)}
            aria-label="Role"
            className="border-line bg-paper h-10 rounded border px-2 text-sm"
          >
            <option value="staff">Staff</option>
            <option value="owner">Owner</option>
          </select>
        </div>
        <ul className="divide-line border-line mt-3 divide-y rounded border">
          {candidates.map((u) => (
            <li key={u.id} className="flex items-center justify-between gap-3 p-3 text-sm">
              <span>
                <span className="font-medium">{u.displayName || '—'}</span>
                <span className="text-muted block text-xs">{u.email}</span>
              </span>
              <Button
                size="sm"
                onClick={async () => {
                  await setAdmin(u.id, { role, name: u.displayName || u.email, email: u.email });
                  invalidate('admin-admins');
                  toast.success(`${u.displayName || u.email} is now ${role}`);
                  setAdding(false);
                }}
              >
                Make {role}
              </Button>
            </li>
          ))}
          {candidates.length === 0 && (
            <li className="text-muted p-4 text-center text-sm">No matching accounts.</li>
          )}
        </ul>
        <p className="text-muted mt-3 text-xs">
          <StatusPill tone="outline">Tip</StatusPill> They may need to sign out and back in to the
          admin.
        </p>
      </Modal>
      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        danger
        title="Remove admin access?"
        body={
          owners <= 1 && admins.find((a) => a.id === removing)?.role === 'owner'
            ? 'This is the last other owner.'
            : 'They keep their store account but can no longer open the admin.'
        }
        confirmLabel="Remove"
        onConfirm={async () => {
          await removeAdmin(removing!);
          invalidate('admin-admins');
          toast.success('Access removed');
        }}
      />
    </section>
  );
}
