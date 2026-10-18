import { useState } from 'react';
import { Eye, EyeOff, FolderTree, Pencil, Plus, Trash2 } from 'lucide-react';
import { slugify, type Category } from '@areqa/shared';
import { PageHeader } from '@/components/PageHeader';
import { SingleImageUpload } from '@/components/products/SingleImageUpload';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field } from '@/components/ui/Field';
import { Thumb } from '@/components/ui/Img';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusPill } from '@/components/ui/StatusPill';
import { Toggle } from '@/components/ui/Toggle';
import {
  countProductsUsing,
  deleteTaxon,
  saveTaxon,
  useInvalidateTaxonomy,
  useTaxonomy,
  type Taxon,
  type TaxonomyKind,
} from '@/features/catalog/taxonomy';
import { toast } from '@/features/ui/toastStore';
import { cn } from '@/lib/cn';

const LABEL: Record<TaxonomyKind, { one: string; many: string }> = {
  categories: { one: 'category', many: 'Categories' },
  collections: { one: 'collection', many: 'Collections' },
};

function TaxonForm({
  kind,
  initial,
  onDone,
}: {
  kind: TaxonomyKind;
  initial: Taxon | null;
  onDone: () => void;
}) {
  const invalidate = useInvalidateTaxonomy();
  const { data: list = [] } = useTaxonomy(kind);
  const [v, setV] = useState<Category>(
    initial ?? {
      name: '',
      slug: '',
      description: '',
      image: null,
      sortOrder: list.length + 1,
      isVisible: true,
    },
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    if (v.name.trim().length < 2) return setError('Enter a name');
    const slug = slugify(v.slug || v.name);
    if (!initial && list.some((t) => t.id === slug))
      return setError(`A ${LABEL[kind].one} with the URL "${slug}" already exists`);
    setBusy(true);
    try {
      await saveTaxon(kind, initial?.id ?? null, { ...v, name: v.name.trim(), slug });
      invalidate(kind);
      toast.success(`${LABEL[kind].one[0]!.toUpperCase()}${LABEL[kind].one.slice(1)} saved`);
      onDone();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Field label="Name" error={error || undefined}>
        {(a) => (
          <input
            {...a}
            value={v.name}
            onChange={(e) =>
              setV({ ...v, name: e.target.value, slug: initial ? v.slug : slugify(e.target.value) })
            }
          />
        )}
      </Field>
      <Field
        label="URL"
        hint={initial ? 'The URL cannot change once created.' : `/shop/${v.slug || '…'}`}
      >
        {(a) => (
          <input
            {...a}
            value={v.slug}
            disabled={Boolean(initial)}
            onChange={(e) => setV({ ...v, slug: slugify(e.target.value) })}
          />
        )}
      </Field>
      <Field label="Description">
        {(a) => (
          <textarea
            {...a}
            className={`${a.className} min-h-20 py-2`}
            value={v.description}
            onChange={(e) => setV({ ...v, description: e.target.value })}
          />
        )}
      </Field>
      <SingleImageUpload
        value={v.image}
        onChange={(image) => setV({ ...v, image })}
        folder={kind}
      />
      <div className="grid grid-cols-2 items-end gap-4">
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
        <div className="pb-2">
          <Toggle
            checked={v.isVisible}
            onChange={(isVisible) => setV({ ...v, isVisible })}
            label="Visible on store"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button onClick={() => void save()} disabled={busy}>
          {busy ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </div>
  );
}

function TaxonList({ kind }: { kind: TaxonomyKind }) {
  const { data = [], isLoading } = useTaxonomy(kind);
  const invalidate = useInvalidateTaxonomy();
  const [editing, setEditing] = useState<Taxon | null | 'new'>(null);
  const [deleting, setDeleting] = useState<Taxon | null>(null);

  const toggleVisible = async (t: Taxon) => {
    const { id, ...rest } = t;
    await saveTaxon(kind, id, { ...rest, isVisible: !t.isVisible });
    invalidate(kind);
  };

  return (
    <section className="card">
      <div className="border-line flex items-center justify-between border-b p-4">
        <h2 className="text-base uppercase">{LABEL[kind].many}</h2>
        <Button size="sm" onClick={() => setEditing('new')}>
          <Plus className="size-4" /> Add
        </Button>
      </div>
      {isLoading ? (
        <Skeleton className="m-4 h-40" />
      ) : data.length === 0 ? (
        <EmptyState icon={FolderTree} title={`No ${LABEL[kind].many.toLowerCase()} yet`} />
      ) : (
        <ul className="divide-line divide-y">
          {data.map((t) => (
            <li
              key={t.id}
              className={cn('flex items-center gap-4 p-4', !t.isVisible && 'opacity-60')}
            >
              <span className="text-muted w-6 text-center text-xs tabular-nums">{t.sortOrder}</span>
              <Thumb src={t.image?.url} size={36} />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{t.name}</p>
                <p className="text-muted truncate text-xs">
                  /shop/{t.slug} · {t.description}
                </p>
              </div>
              {!t.isVisible && <StatusPill tone="outline">Hidden</StatusPill>}
              <div className="flex gap-1">
                <button
                  className="hover:bg-mist rounded p-2"
                  aria-label={t.isVisible ? `Hide ${t.name}` : `Show ${t.name}`}
                  title={t.isVisible ? 'Hide' : 'Show'}
                  onClick={() => void toggleVisible(t)}
                >
                  {t.isVisible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </button>
                <button
                  className="hover:bg-mist rounded p-2"
                  aria-label={`Edit ${t.name}`}
                  onClick={() => setEditing(t)}
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  className="text-danger-deep hover:bg-danger/10 rounded p-2"
                  aria-label={`Delete ${t.name}`}
                  onClick={() => setDeleting(t)}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? `New ${LABEL[kind].one}` : `Edit ${LABEL[kind].one}`}
      >
        {editing !== null && (
          <TaxonForm
            kind={kind}
            initial={editing === 'new' ? null : editing}
            onDone={() => setEditing(null)}
          />
        )}
      </Modal>
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        danger
        title={`Delete ${deleting?.name}?`}
        body={`Products are not deleted, but the ${LABEL[kind].one} page will disappear from the store.`}
        confirmLabel="Delete"
        onConfirm={async () => {
          const used = await countProductsUsing(kind, deleting!.id);
          if (kind === 'categories' && used > 0) {
            toast.error('Category in use', {
              description: `${used} product${used > 1 ? 's use' : ' uses'} it. Move them to another category first.`,
            });
            return;
          }
          await deleteTaxon(kind, deleting!.id);
          invalidate(kind);
          toast.success('Deleted');
        }}
      />
    </section>
  );
}

export default function CategoriesPage() {
  return (
    <>
      <PageHeader
        title="Categories & collections"
        description="Categories organise the catalogue; collections are curated edits like Nairobi Nights."
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <TaxonList kind="categories" />
        <TaxonList kind="collections" />
      </div>
    </>
  );
}
