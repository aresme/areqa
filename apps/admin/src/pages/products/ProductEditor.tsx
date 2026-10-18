import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { GENDER_LABELS, slugify, type Gender } from '@areqa/shared';
import { FormCard } from '@/components/products/FormCard';
import { ImageManager } from '@/components/products/ImageManager';
import { VariantEditor } from '@/components/products/VariantEditor';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Field } from '@/components/ui/Field';
import { Skeleton } from '@/components/ui/Skeleton';
import { TagInput } from '@/components/ui/TagInput';
import { Toggle } from '@/components/ui/Toggle';
import { useTaxonomy } from '@/features/catalog/taxonomy';
import {
  SlugTakenError,
  deleteProducts,
  saveProduct,
  useInvalidateProducts,
  useProduct,
  useProducts,
} from '@/features/products/api';
import { EMPTY_PRODUCT, type ProductFormValues } from '@/features/products/types';
import { buildMatrix } from '@/features/products/variants';
import { toast } from '@/features/ui/toastStore';
import { config } from '@/lib/env';

const schema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and dashes'),
  shortDescription: z.string().trim().min(10, 'Add a one-line summary (10+ characters)').max(200),
  description: z.string().trim().min(20, 'Describe the product (20+ characters)'),
  categoryId: z.string().min(1, 'Choose a category'),
  price: z.number().int('Whole shillings only').positive('Price must be more than 0'),
  compareAtPrice: z.number().int().nullable(),
  images: z.array(z.any()),
  variants: z.array(z.any()).min(1, 'Add at least one colour or size'),
});

const input = 'h-11 w-full rounded border border-line bg-paper px-3 text-sm focus:border-ink';

export default function ProductEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  const { data, isLoading } = useProduct(id);
  const { data: allProducts = [] } = useProducts();
  const { data: categories = [] } = useTaxonomy('categories');
  const { data: collections = [] } = useTaxonomy('collections');
  const invalidate = useInvalidateProducts();
  const [v, setV] = useState<ProductFormValues>(EMPTY_PRODUCT);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Load existing product into the form.
  useEffect(() => {
    if (!data) return;
    const p = data.product;
    const stock = new Map(data.inventory.map((i) => [i.variantKey, i]));
    setV({
      name: p.name,
      slug: p.slug,
      shortDescription: p.shortDescription,
      description: p.description,
      materialCare: p.materialCare,
      categoryId: p.categoryId,
      collectionIds: p.collectionIds,
      tags: p.tags,
      gender: p.gender,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      isFeatured: p.isFeatured,
      isNew: p.isNew,
      isBestSeller: p.isBestSeller,
      status: p.status,
      images: p.images,
      colors: p.colors,
      sizes: p.sizes,
      variants: p.variants.map((x) => ({
        key: x.key,
        color: x.color,
        size: x.size,
        sku: x.sku ?? '',
        stock: stock.get(x.key)?.stock ?? 0,
        lowStockThreshold: stock.get(x.key)?.lowStockThreshold ?? null,
      })),
    });
    setDirty(false);
  }, [data]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => {
    setDirty(true);
    setV((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'name' && !slugTouched) next.slug = slugify(value as string);
      if (key === 'colors' || key === 'sizes')
        next.variants = buildMatrix(next.colors, next.sizes, prev.variants, next.slug);
      return next;
    });
  };

  const tagSuggestions = useMemo(
    () => [...new Set(allProducts.flatMap((p) => p.tags))].sort(),
    [allProducts],
  );

  const save = async (status?: ProductFormValues['status']) => {
    const values = {
      ...v,
      status: status ?? v.status,
      variants: v.variants.length ? v.variants : buildMatrix(v.colors, v.sizes, [], v.slug),
    };
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      toast.error('Please fix the highlighted fields');
      return;
    }
    if (values.status === 'active' && values.images.length === 0) {
      setErrors({ images: 'Add at least one image before publishing' });
      toast.error('Add an image before publishing');
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const savedId = await saveProduct(id ?? null, values);
      setDirty(false);
      invalidate();
      toast.success(isNew ? 'Product created' : 'Product saved', {
        description: values.status === 'active' ? 'Live on the store' : 'Saved as draft',
      });
      if (isNew) navigate(`/products/${savedId}`, { replace: true });
      else setV(values);
    } catch (err) {
      if (err instanceof SlugTakenError) setErrors({ slug: err.message });
      toast.error('Could not save', { description: (err as Error).message });
    } finally {
      setSaving(false);
    }
  };

  if (!isNew && isLoading) return <Skeleton className="h-[70vh] w-full" />;
  if (!isNew && !isLoading && !data)
    return (
      <p>
        Product not found.{' '}
        <Link to="/products" className="underline">
          Back to products
        </Link>
      </p>
    );

  const err = (k: string) => errors[k];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
      noValidate
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to="/products"
            className="text-muted hover:text-ink mb-1 inline-flex items-center gap-1 text-xs"
          >
            <ArrowLeft className="size-3.5" /> Products
          </Link>
          <h1 className="text-2xl uppercase">{isNew ? 'New product' : v.name || 'Edit product'}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!isNew && v.status === 'active' && (
            <a
              href={`${config.storeUrl}/product/${v.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center gap-1.5 px-3 text-xs font-semibold uppercase tracking-wider hover:underline"
            >
              View <ExternalLink className="size-3.5" />
            </a>
          )}
          {v.status === 'draft' ? (
            <>
              <Button variant="secondary" type="submit" disabled={saving}>
                Save draft
              </Button>
              <Button type="button" disabled={saving} onClick={() => void save('active')}>
                {saving ? 'Saving…' : 'Publish'}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                type="button"
                disabled={saving}
                onClick={() => void save('draft')}
              >
                Unpublish
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <FormCard title="Details">
            <div className="grid gap-4">
              <Field label="Name" error={err('name')}>
                {(a) => (
                  <input {...a} value={v.name} onChange={(e) => set('name', e.target.value)} />
                )}
              </Field>
              <Field
                label="URL"
                error={err('slug')}
                hint={`${config.storeUrl.replace(/^https?:\/\//, '')}/product/${v.slug || '…'}`}
              >
                {(a) => (
                  <input
                    {...a}
                    value={v.slug}
                    disabled={!isNew}
                    onChange={(e) => {
                      setSlugTouched(true);
                      set('slug', slugify(e.target.value));
                    }}
                  />
                )}
              </Field>
              <Field
                label="Short description"
                error={err('shortDescription')}
                hint="One line shown under the price."
              >
                {(a) => (
                  <input
                    {...a}
                    value={v.shortDescription}
                    onChange={(e) => set('shortDescription', e.target.value)}
                    maxLength={200}
                  />
                )}
              </Field>
              <Field
                label="Description"
                error={err('description')}
                hint="Leave a blank line between paragraphs."
              >
                {(a) => (
                  <textarea
                    {...a}
                    className={`${a.className} min-h-36 py-2`}
                    value={v.description}
                    onChange={(e) => set('description', e.target.value)}
                  />
                )}
              </Field>
              <Field label="Material & care">
                {(a) => (
                  <textarea
                    {...a}
                    className={`${a.className} min-h-20 py-2`}
                    value={v.materialCare}
                    onChange={(e) => set('materialCare', e.target.value)}
                  />
                )}
              </Field>
            </div>
          </FormCard>

          <FormCard
            title="Images"
            description="Drag to reorder. Tag images with a colour so the gallery switches when a customer picks that colour."
          >
            <ImageManager
              images={v.images}
              onChange={(imgs) => set('images', imgs)}
              colors={v.colors}
              productName={v.name}
            />
            {err('images') && (
              <p role="alert" className="text-danger-deep mt-2 text-sm">
                {err('images')}
              </p>
            )}
          </FormCard>

          <FormCard
            title="Variants"
            description="Add colours and sizes; every combination gets its own stock level."
          >
            <VariantEditor
              colors={v.colors}
              sizes={v.sizes}
              variants={v.variants}
              onColors={(c) => set('colors', c)}
              onSizes={(s) => set('sizes', s)}
              onVariants={(rows) => set('variants', rows)}
            />
            {err('variants') && (
              <p role="alert" className="text-danger-deep mt-2 text-sm">
                {err('variants')}
              </p>
            )}
          </FormCard>
        </div>

        <div className="space-y-6">
          <FormCard title="Pricing">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price (KES)" error={err('price')}>
                {(a) => (
                  <input
                    {...a}
                    type="number"
                    min={0}
                    step={1}
                    value={v.price || ''}
                    onChange={(e) => set('price', Math.round(Number(e.target.value)))}
                  />
                )}
              </Field>
              <Field label="Compare at" hint="Original price for sales">
                {(a) => (
                  <input
                    {...a}
                    type="number"
                    min={0}
                    step={1}
                    value={v.compareAtPrice ?? ''}
                    onChange={(e) =>
                      set(
                        'compareAtPrice',
                        e.target.value ? Math.round(Number(e.target.value)) : null,
                      )
                    }
                  />
                )}
              </Field>
            </div>
            {v.compareAtPrice !== null && v.compareAtPrice <= v.price && (
              <p className="mt-2 text-xs text-[#7A5A00]">
                Compare-at must be higher than the price to show as a sale.
              </p>
            )}
          </FormCard>

          <FormCard title="Organisation">
            <div className="grid gap-4">
              <Field label="Category" error={err('categoryId')}>
                {(a) => (
                  <select
                    {...a}
                    className={input}
                    value={v.categoryId}
                    onChange={(e) => set('categoryId', e.target.value)}
                  >
                    <option value="">Choose…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <Field label="Gender">
                {(a) => (
                  <select
                    {...a}
                    className={input}
                    value={v.gender}
                    onChange={(e) => set('gender', e.target.value as Gender)}
                  >
                    {(Object.keys(GENDER_LABELS) as Gender[]).map((g) => (
                      <option key={g} value={g}>
                        {GENDER_LABELS[g]}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <fieldset>
                <legend className="mb-1.5 text-sm font-medium">Collections</legend>
                <div className="space-y-1.5">
                  {collections.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="accent-ink size-4"
                        checked={v.collectionIds.includes(c.id)}
                        onChange={(e) =>
                          set(
                            'collectionIds',
                            e.target.checked
                              ? [...v.collectionIds, c.id]
                              : v.collectionIds.filter((x) => x !== c.id),
                          )
                        }
                      />
                      {c.name}
                    </label>
                  ))}
                  {collections.length === 0 && (
                    <p className="text-muted text-xs">No collections yet.</p>
                  )}
                </div>
              </fieldset>
              <div>
                <label htmlFor="tags" className="mb-1.5 block text-sm font-medium">
                  Tags
                </label>
                <TagInput
                  id="tags"
                  value={v.tags}
                  onChange={(t) => set('tags', t)}
                  suggestions={tagSuggestions}
                />
                <p className="text-muted mt-1 text-xs">Used for search and related products.</p>
              </div>
            </div>
          </FormCard>

          <FormCard title="Merchandising">
            <div className="space-y-4">
              <Toggle
                checked={v.isNew}
                onChange={(x) => set('isNew', x)}
                label="New arrival"
                description="Shows the New badge and in New In."
              />
              <Toggle
                checked={v.isBestSeller}
                onChange={(x) => set('isBestSeller', x)}
                label="Best seller"
                description="Shown in Best Sellers on the home page."
              />
              <Toggle
                checked={v.isFeatured}
                onChange={(x) => set('isFeatured', x)}
                label="Featured"
                description="Used in menus and category tiles."
              />
            </div>
          </FormCard>

          {!isNew && (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="border-danger/40 text-danger-deep hover:bg-danger/5 flex w-full items-center justify-center gap-2 rounded border py-3 text-sm font-semibold"
            >
              <Trash2 className="size-4" /> Delete product
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        danger
        title="Delete this product?"
        body="It will be removed from the store immediately along with its stock records. Orders keep their own copy. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={async () => {
          await deleteProducts([id!]);
          invalidate();
          setDirty(false);
          toast.success('Product deleted');
          navigate('/products');
        }}
      />
    </form>
  );
}
