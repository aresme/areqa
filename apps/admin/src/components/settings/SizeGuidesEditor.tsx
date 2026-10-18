import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import type { SizeGuide, StoreSettings } from '@areqa/shared';
import { SaveBar } from '@/components/content/SaveBar';
import { Button } from '@/components/ui/Button';
import { saveSettings } from '@/features/settings/api';
import { toast } from '@/features/ui/toastStore';
import { useTaxonomy } from '@/features/catalog/taxonomy';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/cn';

const blank = (): SizeGuide => ({
  title: 'Size guide (cm)',
  columns: ['Size', 'Chest', 'Waist'],
  rows: [{ cells: ['S', '', ''] }],
  note: '',
});

export function SizeGuidesEditor({ settings }: { settings: StoreSettings }) {
  const qc = useQueryClient();
  const { data: categories = [] } = useTaxonomy('categories');
  const [guides, setGuides] = useState(settings.sizeGuides);
  const [key, setKey] = useState('default');
  const [saving, setSaving] = useState(false);
  const g = guides[key];
  const dirty = JSON.stringify(guides) !== JSON.stringify(settings.sizeGuides);
  const set = (next: SizeGuide) => setGuides({ ...guides, [key]: next });
  const label = (k: string) =>
    k === 'default'
      ? 'Default (all other categories)'
      : (categories.find((c) => c.id === k)?.name ?? k);

  const save = async () => {
    setSaving(true);
    try {
      const next = { ...settings, sizeGuides: guides };
      await saveSettings(next);
      qc.setQueryData(['admin-settings'], next);
      toast.success('Size guides saved');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="card p-5">
      <h2 className="text-base uppercase">Size guides</h2>
      <p className="text-muted text-xs">
        Shown from the product page. A category without its own guide uses the default.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-1">
        {[...new Set(['default', ...Object.keys(guides)])].map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKey(k)}
            className={cn(
              'rounded px-3 py-1.5 text-sm',
              key === k ? 'bg-ink text-paper' : 'bg-mist hover:bg-line',
            )}
          >
            {label(k)}
          </button>
        ))}
        <select
          value=""
          onChange={(e) => {
            if (e.target.value) {
              setGuides({ ...guides, [e.target.value]: blank() });
              setKey(e.target.value);
            }
          }}
          aria-label="Add a guide for a category"
          className="border-line bg-paper h-8 rounded border border-dashed px-2 text-xs"
        >
          <option value="">+ Guide for a category…</option>
          {categories
            .filter((c) => !guides[c.id])
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>
      </div>

      {!g ? (
        <div className="mt-4">
          <Button size="sm" variant="secondary" onClick={() => set(blank())}>
            Create default guide
          </Button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <input
            value={g.title}
            onChange={(e) => set({ ...g, title: e.target.value })}
            aria-label="Guide title"
            className="border-line h-10 w-full rounded border px-3 text-sm font-medium"
          />
          <div className="overflow-x-auto">
            <table className="text-sm">
              <thead>
                <tr>
                  {g.columns.map((c, ci) => (
                    <th key={ci} className="p-1">
                      <div className="flex items-center gap-1">
                        <input
                          value={c}
                          onChange={(e) =>
                            set({
                              ...g,
                              columns: g.columns.map((x, j) => (j === ci ? e.target.value : x)),
                            })
                          }
                          aria-label={`Column ${ci + 1} name`}
                          className="border-line bg-mist h-9 w-28 rounded border px-2 text-xs font-semibold uppercase"
                        />
                        {g.columns.length > 2 && (
                          <button
                            type="button"
                            aria-label={`Remove column ${c}`}
                            onClick={() =>
                              set({
                                ...g,
                                columns: g.columns.filter((_, j) => j !== ci),
                                rows: g.rows.map((r) => ({
                                  cells: r.cells.filter((_, j) => j !== ci),
                                })),
                              })
                            }
                            className="text-muted hover:text-ink"
                          >
                            <X className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="p-1">
                    <button
                      type="button"
                      onClick={() =>
                        set({
                          ...g,
                          columns: [...g.columns, 'New'],
                          rows: g.rows.map((r) => ({ cells: [...r.cells, ''] })),
                        })
                      }
                      className="border-line rounded border border-dashed px-2 py-1.5 text-xs"
                    >
                      + Column
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {g.rows.map((r, ri) => (
                  <tr key={ri}>
                    {r.cells.map((cell, ci) => (
                      <td key={ci} className="p-1">
                        <input
                          value={cell}
                          onChange={(e) =>
                            set({
                              ...g,
                              rows: g.rows.map((x, j) =>
                                j === ri
                                  ? {
                                      cells: x.cells.map((y, k) => (k === ci ? e.target.value : y)),
                                    }
                                  : x,
                              ),
                            })
                          }
                          aria-label={`${g.columns[ci]} for row ${ri + 1}`}
                          className={cn(
                            'border-line h-9 w-28 rounded border px-2',
                            ci === 0 && 'font-semibold',
                          )}
                        />
                      </td>
                    ))}
                    <td className="p-1">
                      <button
                        type="button"
                        aria-label={`Remove row ${ri + 1}`}
                        onClick={() => set({ ...g, rows: g.rows.filter((_, j) => j !== ri) })}
                        className="text-danger-deep hover:bg-danger/10 rounded p-2"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => set({ ...g, rows: [...g.rows, { cells: g.columns.map(() => '') }] })}
          >
            <Plus className="size-4" /> Row
          </Button>
          <textarea
            value={g.note}
            onChange={(e) => set({ ...g, note: e.target.value })}
            rows={2}
            placeholder="Fit note, e.g. Measure around the fullest part of your chest."
            aria-label="Guide note"
            className="border-line w-full rounded border p-2.5 text-sm"
          />
          {key !== 'default' && (
            <button
              type="button"
              className="text-danger-deep text-xs underline"
              onClick={() => {
                const { [key]: _removed, ...rest } = guides;
                setGuides(rest);
                setKey('default');
              }}
            >
              Remove this category's guide
            </button>
          )}
        </div>
      )}
      <SaveBar
        dirty={dirty}
        saving={saving}
        onSave={() => void save()}
        onReset={() => setGuides(settings.sizeGuides)}
      />
    </section>
  );
}
