import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Copy, ExternalLink, Plus, Shirt } from 'lucide-react';
import { DEFAULT_LOW_STOCK_THRESHOLD, formatKES } from '@areqa/shared';
import { PageHeader } from '@/components/PageHeader';
import { Button, ButtonLink } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Thumb } from '@/components/ui/Img';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusPill } from '@/components/ui/StatusPill';
import { useTaxonomy } from '@/features/catalog/taxonomy';
import {
  deleteProducts,
  duplicateProduct,
  setProductsStatus,
  useInvalidateProducts,
  useProducts,
} from '@/features/products/api';
import { toast } from '@/features/ui/toastStore';
import { config } from '@/lib/env';

export default function ProductList() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useTaxonomy('categories');
  const invalidate = useInvalidateProducts();
  const catName = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

  const rows = useMemo(() => {
    const needle = q.toLowerCase();
    return products.filter(
      (p) =>
        (!needle ||
          p.name.toLowerCase().includes(needle) ||
          p.tags.some((t) => t.includes(needle)) ||
          p.variants.some((v) => v.sku?.toLowerCase().includes(needle))) &&
        (!category || p.categoryId === category) &&
        (!status ||
          p.status === status ||
          (status === 'low' && p.totalStock <= DEFAULT_LOW_STOCK_THRESHOLD)),
    );
  }, [products, q, category, status]);

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const bulk = async (action: 'active' | 'draft') => {
    const ids = [...selected];
    await setProductsStatus(ids, action);
    toast.success(
      `${ids.length} product${ids.length > 1 ? 's' : ''} ${action === 'active' ? 'activated' : 'moved to draft'}`,
    );
    setSelected(new Set());
    invalidate();
  };

  return (
    <>
      <PageHeader
        title="Products"
        description={`${products.length} products · ${products.filter((p) => p.status === 'active').length} active`}
        actions={
          <ButtonLink to="/products/new">
            <Plus className="size-4" /> New product
          </ButtonLink>
        }
      />

      <div className="card mb-4 flex flex-wrap items-center gap-3 p-3">
        <input
          value={q}
          onChange={(e) =>
            setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })
          }
          placeholder="Search name, tag or SKU"
          aria-label="Search products"
          className="border-line h-10 min-w-56 flex-1 rounded border px-3 text-sm"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
          className="border-line bg-paper h-10 rounded border px-3 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
          className="border-line bg-paper h-10 rounded border px-3 text-sm"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="low">Low stock</option>
        </select>
      </div>

      {selected.size > 0 && (
        <div className="bg-ink text-paper sticky top-16 z-10 mb-4 flex flex-wrap items-center gap-2 rounded px-4 py-2 text-sm">
          <span className="mr-2 font-semibold">{selected.size} selected</span>
          <Button size="sm" variant="mint" onClick={() => void bulk('active')}>
            Activate
          </Button>
          <Button
            size="sm"
            className="border-paper/40 text-paper hover:bg-paper hover:text-ink border bg-transparent"
            onClick={() => void bulk('draft')}
          >
            Set draft
          </Button>
          <Button
            size="sm"
            className="bg-danger text-paper hover:bg-danger-deep hover:text-paper"
            onClick={() => setConfirmDelete(true)}
          >
            Delete
          </Button>
          <button className="ml-auto text-xs underline" onClick={() => setSelected(new Set())}>
            Clear
          </button>
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : products.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Shirt}
            title="No products yet"
            body="Add your first product to start selling."
            action={<ButtonLink to="/products/new">Add product</ButtonLink>}
          />
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-line bg-mist text-muted border-b text-xs uppercase tracking-wider">
              <tr>
                <th className="w-10 p-3">
                  <input
                    type="checkbox"
                    aria-label="Select all"
                    checked={allSelected}
                    onChange={() =>
                      setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)))
                    }
                    className="accent-ink size-4"
                  />
                </th>
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Price</th>
                <th className="p-3 text-right">Stock</th>
                <th className="p-3">Status</th>
                <th className="p-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-line divide-y">
              {rows.map((p) => (
                <tr key={p.id} className="hover:bg-mist/60">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      aria-label={`Select ${p.name}`}
                      checked={selected.has(p.id)}
                      onChange={() => toggle(p.id)}
                      className="accent-ink size-4"
                    />
                  </td>
                  <td className="p-3">
                    <Link
                      to={`/products/${p.id}`}
                      className="flex items-center gap-3 font-medium hover:underline"
                    >
                      <Thumb src={p.images[0]?.url} size={36} />
                      <span>
                        {p.name}
                        <span className="text-muted block text-xs font-normal">
                          {p.variants.length} {p.variants.length === 1 ? 'variant' : 'variants'}
                          {p.isNew ? ' · New' : ''}
                          {p.isOnSale ? ' · Sale' : ''}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="text-muted p-3">{catName.get(p.categoryId) ?? '—'}</td>
                  <td className="p-3 text-right tabular-nums">
                    {formatKES(p.price)}
                    {p.compareAtPrice && (
                      <s className="text-muted block text-xs">{formatKES(p.compareAtPrice)}</s>
                    )}
                  </td>
                  <td className="p-3 text-right tabular-nums">
                    {p.totalStock === 0 ? (
                      <StatusPill tone="danger">Sold out</StatusPill>
                    ) : p.totalStock <= DEFAULT_LOW_STOCK_THRESHOLD ? (
                      <StatusPill tone="warn">{p.totalStock} left</StatusPill>
                    ) : (
                      p.totalStock
                    )}
                  </td>
                  <td className="p-3">
                    <StatusPill tone={p.status === 'active' ? 'mint' : 'outline'}>
                      {p.status}
                    </StatusPill>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <button
                        title="Duplicate"
                        aria-label={`Duplicate ${p.name}`}
                        className="hover:bg-mist rounded p-2"
                        onClick={async () => {
                          const id = await duplicateProduct(p.id);
                          toast.success('Duplicated as draft', {
                            action: { label: 'Open', href: `/products/${id}` },
                          });
                          invalidate();
                        }}
                      >
                        <Copy className="size-4" />
                      </button>
                      {p.status === 'active' && (
                        <a
                          href={`${config.storeUrl}/product/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          title="View on store"
                          aria-label={`View ${p.name} on store`}
                          className="hover:bg-mist rounded p-2"
                        >
                          <ExternalLink className="size-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <p className="text-muted p-8 text-center text-sm">No products match these filters.</p>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        danger
        title={`Delete ${selected.size} product${selected.size > 1 ? 's' : ''}?`}
        body="This permanently removes the products and their stock records. Existing orders keep their copy of the item. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={async () => {
          await deleteProducts([...selected]);
          toast.success('Deleted');
          setSelected(new Set());
          invalidate();
        }}
      />
    </>
  );
}
