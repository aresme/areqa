import { useMemo, useState } from 'react';
import { AlertTriangle, Pencil, Plus, Trash2, Truck } from 'lucide-react';
import { KENYA_COUNTIES, formatKES, type DeliveryZone, type WithId } from '@areqa/shared';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusPill } from '@/components/ui/StatusPill';
import { TagInput } from '@/components/ui/TagInput';
import { Toggle } from '@/components/ui/Toggle';
import {
  deleteZone,
  saveZone,
  uncoveredCounties,
  useInvalidate,
  useZones,
} from '@/features/settings/api';
import { toast } from '@/features/ui/toastStore';
import { cn } from '@/lib/cn';

function ZoneForm({
  zone,
  nextOrder,
  onDone,
}: {
  zone: WithId<DeliveryZone> | null;
  nextOrder: number;
  onDone: () => void;
}) {
  const invalidate = useInvalidate();
  const [v, setV] = useState<DeliveryZone>(
    zone ?? {
      name: '',
      counties: [],
      towns: [],
      fee: 300,
      estimatedDays: '1–2 days',
      sortOrder: nextOrder,
      isActive: true,
    },
  );
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const counties = KENYA_COUNTIES.filter((c) => c.toLowerCase().includes(filter.toLowerCase()));

  const save = async () => {
    if (v.name.trim().length < 2) return setError('Name the zone');
    if (v.counties.length === 0) return setError('Choose at least one county');
    setBusy(true);
    try {
      await saveZone(zone?.id ?? null, {
        ...v,
        name: v.name.trim(),
        fee: Math.max(0, Math.round(v.fee)),
      });
      invalidate('admin-zones');
      toast.success('Zone saved');
      onDone();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Zone name" className="sm:col-span-3">
          {(a) => (
            <input
              {...a}
              value={v.name}
              onChange={(e) => setV({ ...v, name: e.target.value })}
              placeholder="Nairobi & Metro"
            />
          )}
        </Field>
        <Field label="Fee (KES)">
          {(a) => (
            <input
              {...a}
              type="number"
              min={0}
              value={v.fee}
              onChange={(e) => setV({ ...v, fee: Number(e.target.value) })}
            />
          )}
        </Field>
        <Field label="Delivery time">
          {(a) => (
            <input
              {...a}
              value={v.estimatedDays}
              onChange={(e) => setV({ ...v, estimatedDays: e.target.value })}
            />
          )}
        </Field>
        <Field label="Sort order">
          {(a) => (
            <input
              {...a}
              type="number"
              value={v.sortOrder}
              onChange={(e) => setV({ ...v, sortOrder: Number(e.target.value) })}
            />
          )}
        </Field>
      </div>
      <fieldset>
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <legend className="text-sm font-medium">Counties ({v.counties.length})</legend>
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter"
            aria-label="Filter counties"
            className="border-line h-8 w-36 rounded border px-2 text-xs"
          />
        </div>
        <div className="border-line grid max-h-48 grid-cols-2 gap-x-4 gap-y-1 overflow-y-auto rounded border p-3 sm:grid-cols-3">
          {counties.map((c) => (
            <label key={c} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="accent-ink size-4"
                checked={v.counties.includes(c)}
                onChange={(e) =>
                  setV({
                    ...v,
                    counties: e.target.checked
                      ? [...v.counties, c]
                      : v.counties.filter((x) => x !== c),
                  })
                }
              />
              {c}
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="zone-towns" className="mb-1.5 block text-sm font-medium">
          Specific towns (optional)
        </label>
        <TagInput
          id="zone-towns"
          value={v.towns}
          onChange={(towns) => setV({ ...v, towns })}
          normalize={(s) => s.trim().replace(/\b\w/g, (m) => m.toUpperCase())}
          placeholder="e.g. Milimani, Lanet"
        />
        <p className="text-muted mt-1 text-xs">
          Leave empty to cover whole counties. A zone listing a town beats a county-wide zone for
          that town.
        </p>
      </div>
      <Toggle
        checked={v.isActive}
        onChange={(isActive) => setV({ ...v, isActive })}
        label="Active"
      />
      {error && (
        <p role="alert" className="text-danger-deep text-sm">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button onClick={() => void save()} disabled={busy}>
          {busy ? 'Saving…' : 'Save zone'}
        </Button>
      </div>
    </div>
  );
}

export function ZonesEditor() {
  const { data: zones = [], isLoading } = useZones();
  const invalidate = useInvalidate();
  const [editing, setEditing] = useState<WithId<DeliveryZone> | 'new' | null>(null);
  const [deleting, setDeleting] = useState<WithId<DeliveryZone> | null>(null);
  const missing = useMemo(() => uncoveredCounties(zones, KENYA_COUNTIES), [zones]);

  return (
    <section className="card">
      <div className="border-line flex items-center justify-between border-b p-4">
        <div>
          <h2 className="text-base uppercase">Delivery zones</h2>
          <p className="text-muted text-xs">
            Checkout picks the zone from the customer's county and town.
          </p>
        </div>
        <Button size="sm" onClick={() => setEditing('new')}>
          <Plus className="size-4" /> Zone
        </Button>
      </div>
      {missing.length > 0 && !isLoading && (
        <p className="border-line flex gap-2 border-b bg-[#FFF8E1] p-4 text-sm text-[#7A5A00]">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" /> No delivery to: {missing.join(', ')}.
          Customers there can only choose pickup.
        </p>
      )}
      {isLoading ? (
        <Skeleton className="m-4 h-40" />
      ) : zones.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No delivery zones"
          body="Add at least one zone so customers can choose delivery."
        />
      ) : (
        <ul className="divide-line divide-y">
          {zones.map((z) => (
            <li
              key={z.id}
              className={cn('flex items-center gap-4 p-4', !z.isActive && 'opacity-60')}
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {z.name} {!z.isActive && <StatusPill tone="outline">Off</StatusPill>}
                </p>
                <p className="text-muted truncate text-xs">
                  {z.towns.length ? `${z.towns.join(', ')} · ` : ''}
                  {z.counties.length > 6 ? `${z.counties.length} counties` : z.counties.join(', ')}
                </p>
              </div>
              <p className="text-right text-sm">
                <span className="font-semibold tabular-nums">{formatKES(z.fee)}</span>
                <span className="text-muted block text-xs">{z.estimatedDays}</span>
              </p>
              <button
                className="hover:bg-mist rounded p-2"
                aria-label={`Edit ${z.name}`}
                onClick={() => setEditing(z)}
              >
                <Pencil className="size-4" />
              </button>
              <button
                className="text-danger-deep hover:bg-danger/10 rounded p-2"
                aria-label={`Delete ${z.name}`}
                onClick={() => setDeleting(z)}
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'New delivery zone' : 'Edit delivery zone'}
      >
        {editing !== null && (
          <ZoneForm
            zone={editing === 'new' ? null : editing}
            nextOrder={zones.length + 1}
            onDone={() => setEditing(null)}
          />
        )}
      </Modal>
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        danger
        title={`Delete ${deleting?.name}?`}
        body="Customers in its counties will no longer be offered delivery. Existing orders are unaffected."
        confirmLabel="Delete"
        onConfirm={async () => {
          await deleteZone(deleting!.id);
          invalidate('admin-zones');
          toast.success('Zone deleted');
        }}
      />
    </section>
  );
}
