import { useMemo, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { Boxes } from 'lucide-react';
import type { InventoryItem } from '@areqa/shared';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Thumb } from '@/components/ui/Img';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusPill } from '@/components/ui/StatusPill';
import { updateVariant, useInventoryAll, useInventoryCache } from '@/features/inventory/api';
import { useProducts } from '@/features/products/api';
import { lowStockDefault, useStoreSettings } from '@/features/settings/storeSettings';
import { toast } from '@/features/ui/toastStore';
import { cn } from '@/lib/cn';

type View = 'all' | 'low' | 'out';

function NumberCell({
  value,
  placeholder,
  onCommit,
  label,
  danger,
}: {
  value: number | null;
  placeholder?: string;
  onCommit: (v: number | null) => Promise<void>;
  label: string;
  danger?: boolean;
}) {
  const [text, setText] = useState(value === null ? '' : String(value));
  const [busy, setBusy] = useState(false);
  const commit = async () => {
    const next = text.trim() === '' ? null : Math.max(0, Math.floor(Number(text)));
    if (next === value || (next !== null && Number.isNaN(next)))
      return setText(value === null ? '' : String(value));
    setBusy(true);
    try {
      await onCommit(next);
    } catch (e) {
      setText(value === null ? '' : String(value));
      toast.error('Not saved', { description: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
    if (e.key === 'Escape') setText(value === null ? '' : String(value));
  };
  return (
    <input
      type="number"
      min={0}
      value={text}
      placeholder={placeholder}
      aria-label={label}
      disabled={busy}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => void commit()}
      onKeyDown={onKey}
      className={cn(
        'focus:border-ink h-9 w-20 rounded border px-2 text-right tabular-nums transition-colors',
        danger ? 'border-danger/50 bg-danger/5' : 'border-line',
        busy && 'opacity-50',
      )}
    />
  );
}

export default function InventoryPage() {
  const { data: items = [], isLoading } = useInventoryAll();
  const { data: products = [] } = useProducts();
  const { data: settings } = useStoreSettings();
  const cache = useInventoryCache();
  const [view, setView] = useState<View>('all');
  const [q, setQ] = useState('');
  const defaultThreshold = lowStockDefault(settings);
  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const rows = useMemo(() => {
    const needle = q.toLowerCase();
    return items
      .filter((i) => byId.has(i.productId))
      .filter((i) => {
        const p = byId.get(i.productId)!;
        const threshold = i.lowStockThreshold ?? defaultThreshold;
        return (
          (view === 'all' || (view === 'out' ? i.stock === 0 : i.stock <= threshold)) &&
          (!needle ||
            p.name.toLowerCase().includes(needle) ||
            i.sku?.toLowerCase().includes(needle) ||
            i.color.toLowerCase().includes(needle))
        );
      })
      .sort(
        (a, b) =>
          byId.get(a.productId)!.name.localeCompare(byId.get(b.productId)!.name) ||
          a.color.localeCompare(b.color),
      );
  }, [items, byId, view, q, defaultThreshold]);

  const counts = useMemo(
    () => ({
      all: items.length,
      low: items.filter((i) => i.stock <= (i.lowStockThreshold ?? defaultThreshold)).length,
      out: items.filter((i) => i.stock === 0).length,
    }),
    [items, defaultThreshold],
  );

  const save =
    (item: InventoryItem, patch: Partial<Pick<InventoryItem, 'stock' | 'lowStockThreshold'>>) =>
    async () => {
      await updateVariant(
        item,
        patch,
        items.filter((i) => i.productId === item.productId),
      );
      cache.patch(item.productId, item.variantKey, patch);
      cache.invalidateProducts();
      toast.success('Saved', {
        description: `${byId.get(item.productId)?.name} · ${item.color} ${item.size}`,
      });
    };

  return (
    <>
      <PageHeader
        title="Inventory"
        description={`Edit stock in place — press Enter or click away to save. Low-stock alert defaults to ${defaultThreshold} (change it in Settings).`}
      />
      <div className="card mb-4 flex flex-wrap items-center gap-3 p-3">
        <div className="flex gap-1" role="tablist" aria-label="Filter">
          {(['all', 'low', 'out'] as View[]).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={cn(
                'rounded px-3 py-2 text-sm font-medium',
                view === v ? 'bg-ink text-paper' : 'text-muted hover:bg-mist',
              )}
            >
              {v === 'all' ? 'All variants' : v === 'low' ? 'Low stock' : 'Sold out'}{' '}
              <span className="ml-1 tabular-nums opacity-70">{counts[v]}</span>
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search product, SKU or colour"
          aria-label="Search inventory"
          className="border-line h-10 min-w-56 flex-1 rounded border px-3 text-sm"
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : rows.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Boxes}
            title={view === 'all' ? 'No inventory yet' : 'Nothing here'}
            body={
              view === 'all'
                ? 'Add products with variants to manage stock.'
                : 'Every variant is above its alert level.'
            }
          />
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-line bg-mist text-muted border-b text-xs uppercase tracking-wider">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Variant</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Stock</th>
                <th className="p-3 text-right">Low alert</th>
              </tr>
            </thead>
            <tbody className="divide-line divide-y">
              {rows.map((i) => {
                const p = byId.get(i.productId)!;
                const threshold = i.lowStockThreshold ?? defaultThreshold;
                return (
                  <tr key={`${i.productId}-${i.variantKey}`} className="hover:bg-mist/40">
                    <td className="p-3">
                      <Link
                        to={`/products/${p.id}`}
                        className="flex items-center gap-3 font-medium hover:underline"
                      >
                        <Thumb
                          src={(p.images.find((im) => im.color === i.color) ?? p.images[0])?.url}
                          size={28}
                        />
                        {p.name}
                        {p.status === 'draft' && <StatusPill tone="outline">Draft</StatusPill>}
                      </Link>
                    </td>
                    <td className="p-3">
                      {i.color} · {i.size}
                    </td>
                    <td className="text-muted p-3 font-mono text-xs">{i.sku || '—'}</td>
                    <td className="p-3">
                      {i.stock === 0 ? (
                        <StatusPill tone="danger">Sold out</StatusPill>
                      ) : i.stock <= threshold ? (
                        <StatusPill tone="warn">Low</StatusPill>
                      ) : (
                        <StatusPill tone="mist">OK</StatusPill>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <NumberCell
                        key={`s-${i.stock}`}
                        value={i.stock}
                        label={`Stock for ${p.name} ${i.color} ${i.size}`}
                        danger={i.stock === 0}
                        onCommit={(v) => save(i, { stock: v ?? 0 })()}
                      />
                    </td>
                    <td className="p-3 text-right">
                      <NumberCell
                        key={`t-${i.lowStockThreshold}`}
                        value={i.lowStockThreshold}
                        placeholder={String(defaultThreshold)}
                        label={`Low stock alert for ${p.name} ${i.color} ${i.size}`}
                        onCommit={(v) => save(i, { lowStockThreshold: v })()}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
