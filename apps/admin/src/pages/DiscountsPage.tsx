import { useState } from 'react';
import { Pencil, Plus, TicketPercent, Trash2 } from 'lucide-react';
import { formatDate, formatKES, normalizeCode, toDate, type Discount } from '@areqa/shared';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusPill, type PillTone } from '@/components/ui/StatusPill';
import { Toggle } from '@/components/ui/Toggle';
import {
  CodeTakenError,
  deleteDiscount,
  discountState,
  saveDiscount,
  setDiscountActive,
  useDiscounts,
  useInvalidateDiscounts,
  type DiscountForm,
} from '@/features/discounts/api';
import { toast } from '@/features/ui/toastStore';

const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const TONE: Record<ReturnType<typeof discountState>, PillTone> = {
  active: 'mint',
  scheduled: 'mist',
  expired: 'outline',
  'used up': 'outline',
  off: 'outline',
};

function DiscountEditor({ existing, onDone }: { existing: Discount | null; onDone: () => void }) {
  const invalidate = useInvalidateDiscounts();
  const today = new Date();
  const [v, setV] = useState<DiscountForm>(
    existing
      ? {
          code: existing.code,
          type: existing.type,
          value: existing.value,
          minOrder: existing.minOrder,
          startsAt: ymd(toDate(existing.startsAt) ?? today),
          endsAt: ymd(toDate(existing.endsAt) ?? today),
          usageLimit: existing.usageLimit,
          isActive: existing.isActive,
        }
      : {
          code: '',
          type: 'percentage',
          value: 10,
          minOrder: 0,
          startsAt: ymd(today),
          endsAt: ymd(new Date(today.getTime() + 30 * 86_400_000)),
          usageLimit: null,
          isActive: true,
        },
  );
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const code = normalizeCode(v.code);
    if (!/^[A-Z0-9]{3,20}$/.test(code))
      return setError('Codes are 3–20 letters or numbers, no spaces.');
    if (v.type === 'percentage' && (v.value < 1 || v.value > 90))
      return setError('Percentage must be between 1 and 90.');
    if (v.type === 'fixed' && v.value < 1) return setError('Enter an amount in KES.');
    if (v.endsAt < v.startsAt) return setError('End date must be after the start date.');
    setError('');
    setBusy(true);
    try {
      await saveDiscount(v, existing);
      invalidate();
      toast.success(existing ? 'Code updated' : `Code ${code} created`);
      onDone();
    } catch (e) {
      setError(e instanceof CodeTakenError ? e.message : 'Could not save the code.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field
        label="Code"
        hint={existing ? 'Codes cannot be renamed.' : 'Customers type this at checkout.'}
        className="sm:col-span-2"
      >
        {(a) => (
          <input
            {...a}
            value={v.code}
            disabled={Boolean(existing)}
            onChange={(e) => setV({ ...v, code: e.target.value.toUpperCase().replace(/\s/g, '') })}
            className={`${a.className} font-mono uppercase`}
            placeholder="KARIBU10"
          />
        )}
      </Field>
      <Field label="Type">
        {(a) => (
          <select
            {...a}
            value={v.type}
            onChange={(e) => setV({ ...v, type: e.target.value as Discount['type'] })}
          >
            <option value="percentage">Percentage off</option>
            <option value="fixed">Fixed amount (KES)</option>
          </select>
        )}
      </Field>
      <Field label={v.type === 'percentage' ? 'Percent off' : 'Amount off (KES)'}>
        {(a) => (
          <input
            {...a}
            type="number"
            min={1}
            value={v.value}
            onChange={(e) => setV({ ...v, value: Number(e.target.value) })}
          />
        )}
      </Field>
      <Field label="Minimum order (KES)" hint="0 for no minimum">
        {(a) => (
          <input
            {...a}
            type="number"
            min={0}
            value={v.minOrder}
            onChange={(e) => setV({ ...v, minOrder: Number(e.target.value) })}
          />
        )}
      </Field>
      <Field label="Usage limit" hint="Leave blank for unlimited">
        {(a) => (
          <input
            {...a}
            type="number"
            min={1}
            value={v.usageLimit ?? ''}
            onChange={(e) =>
              setV({ ...v, usageLimit: e.target.value ? Number(e.target.value) : null })
            }
          />
        )}
      </Field>
      <Field label="Starts">
        {(a) => (
          <input
            {...a}
            type="date"
            value={v.startsAt}
            onChange={(e) => setV({ ...v, startsAt: e.target.value })}
          />
        )}
      </Field>
      <Field label="Ends (inclusive)">
        {(a) => (
          <input
            {...a}
            type="date"
            value={v.endsAt}
            onChange={(e) => setV({ ...v, endsAt: e.target.value })}
          />
        )}
      </Field>
      <div className="sm:col-span-2">
        <Toggle
          checked={v.isActive}
          onChange={(isActive) => setV({ ...v, isActive })}
          label="Active"
          description="Turn off to pause the code without deleting it."
        />
      </div>
      {existing && (
        <p className="text-muted text-xs sm:col-span-2">
          Used {existing.usedCount} time{existing.usedCount === 1 ? '' : 's'} so far.
        </p>
      )}
      {error && (
        <p role="alert" className="text-danger-deep text-sm sm:col-span-2">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2 sm:col-span-2">
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button onClick={() => void submit()} disabled={busy}>
          {busy ? 'Saving…' : 'Save code'}
        </Button>
      </div>
    </div>
  );
}

export default function DiscountsPage() {
  const { data = [], isLoading } = useDiscounts();
  const invalidate = useInvalidateDiscounts();
  const [editing, setEditing] = useState<Discount | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Discount | null>(null);

  return (
    <>
      <PageHeader
        title="Discount codes"
        description="Codes are checked at checkout and again inside the order transaction."
        actions={
          <Button onClick={() => setEditing('new')}>
            <Plus className="size-4" /> New code
          </Button>
        }
      />
      {isLoading ? (
        <Skeleton className="h-64" />
      ) : data.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={TicketPercent}
            title="No discount codes"
            body="Create a code for a promotion or a welcome offer."
            action={<Button onClick={() => setEditing('new')}>Create code</Button>}
          />
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-line bg-mist text-muted border-b text-xs uppercase tracking-wider">
              <tr>
                <th className="p-3">Code</th>
                <th className="p-3">Discount</th>
                <th className="p-3">Minimum</th>
                <th className="p-3">Valid</th>
                <th className="p-3 text-right">Used</th>
                <th className="p-3">Status</th>
                <th className="p-3">On</th>
                <th className="p-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-line divide-y">
              {data.map((d) => {
                const state = discountState(d);
                return (
                  <tr key={d.code} className="hover:bg-mist/60">
                    <td className="p-3 font-mono font-semibold">{d.code}</td>
                    <td className="p-3">
                      {d.type === 'percentage' ? `${d.value}% off` : `${formatKES(d.value)} off`}
                    </td>
                    <td className="text-muted p-3">
                      {d.minOrder ? formatKES(d.minOrder) : 'None'}
                    </td>
                    <td className="text-muted p-3">
                      {formatDate(d.startsAt)} – {formatDate(d.endsAt)}
                    </td>
                    <td className="p-3 text-right tabular-nums">
                      {d.usedCount}
                      {d.usageLimit !== null && (
                        <span className="text-muted"> / {d.usageLimit}</span>
                      )}
                    </td>
                    <td className="p-3">
                      <StatusPill tone={TONE[state]}>{state}</StatusPill>
                    </td>
                    <td className="p-3">
                      <button
                        role="switch"
                        aria-checked={d.isActive}
                        aria-label={`${d.isActive ? 'Pause' : 'Activate'} ${d.code}`}
                        onClick={async () => {
                          await setDiscountActive(d.code, !d.isActive);
                          invalidate();
                        }}
                        className={`relative h-6 w-11 rounded-full transition-colors ${d.isActive ? 'bg-ink' : 'bg-line'}`}
                      >
                        <span
                          className={`absolute top-0.5 size-5 rounded-full shadow transition-transform ${d.isActive ? 'bg-mint translate-x-[22px]' : 'bg-paper translate-x-0.5'}`}
                        />
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <button
                          className="hover:bg-mist rounded p-2"
                          aria-label={`Edit ${d.code}`}
                          onClick={() => setEditing(d)}
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          className="text-danger-deep hover:bg-danger/10 rounded p-2"
                          aria-label={`Delete ${d.code}`}
                          onClick={() => setDeleting(d)}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'New discount code' : `Edit ${editing?.code ?? ''}`}
      >
        {editing !== null && (
          <DiscountEditor
            existing={editing === 'new' ? null : editing}
            onDone={() => setEditing(null)}
          />
        )}
      </Modal>
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        danger
        title={`Delete ${deleting?.code}?`}
        body="Customers will no longer be able to use it. Orders that already used it are unaffected. To pause a code instead, switch it off."
        confirmLabel="Delete"
        onConfirm={async () => {
          await deleteDiscount(deleting!.code);
          invalidate();
          toast.success('Code deleted');
        }}
      />
    </>
  );
}
