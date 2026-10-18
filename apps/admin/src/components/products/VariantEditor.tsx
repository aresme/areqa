import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { COLOR_PALETTE, SIZE_ORDER, SIZE_PRESETS, type ProductColor } from '@areqa/shared';
import type { VariantRow } from '@/features/products/types';
import { cn } from '@/lib/cn';

interface VariantEditorProps {
  colors: ProductColor[];
  sizes: string[];
  variants: VariantRow[];
  onColors: (c: ProductColor[]) => void;
  onSizes: (s: string[]) => void;
  onVariants: (v: VariantRow[]) => void;
}

const PRESET_LABELS: Record<keyof typeof SIZE_PRESETS, string> = {
  apparel: 'XS–XXL',
  waist: 'Waist 28–38',
  shoes: 'Shoes 38–45',
  oneSize: 'One size',
};

const sortSizes = (list: string[]) =>
  [...list].sort((a, b) => (SIZE_ORDER.indexOf(a) + 1 || 999) - (SIZE_ORDER.indexOf(b) + 1 || 999));

export function VariantEditor({
  colors,
  sizes,
  variants,
  onColors,
  onSizes,
  onVariants,
}: VariantEditorProps) {
  const [customName, setCustomName] = useState('');
  const [customHex, setCustomHex] = useState('#0B0B0B');
  const [customSize, setCustomSize] = useState('');
  const [bulkStock, setBulkStock] = useState('');

  const addColor = (c: ProductColor) => {
    if (!c.name.trim() || colors.some((x) => x.name.toLowerCase() === c.name.trim().toLowerCase()))
      return;
    onColors([...colors, { name: c.name.trim(), hex: c.hex }]);
  };
  const addSize = (s: string) => {
    const v = s.trim();
    if (v && !sizes.includes(v)) onSizes(sortSizes([...sizes, v]));
  };
  const update = (key: string, patch: Partial<VariantRow>) =>
    onVariants(variants.map((v) => (v.key === key ? { ...v, ...patch } : v)));
  const total = variants.reduce((n, v) => n + (v.stock || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium">Colours</p>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <span
              key={c.name}
              className="border-line inline-flex items-center gap-2 rounded-full border py-1 pl-1 pr-2 text-sm"
            >
              <span
                className="border-ink/10 size-5 rounded-full border"
                style={{ background: c.hex }}
              />
              {c.name}
              <button
                type="button"
                aria-label={`Remove ${c.name}`}
                onClick={() => onColors(colors.filter((x) => x.name !== c.name))}
                className="text-muted hover:text-ink"
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Quick add colour">
          {COLOR_PALETTE.filter((p) => !colors.some((c) => c.name === p.name)).map((p) => (
            <button
              key={p.name}
              type="button"
              title={p.name}
              aria-label={`Add ${p.name}`}
              onClick={() => addColor(p)}
              className="border-line size-7 rounded-full border transition-transform hover:scale-110"
              style={{ background: p.hex }}
            />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Custom colour name"
            aria-label="Custom colour name"
            className="border-line h-9 rounded border px-3 text-sm"
          />
          <input
            type="color"
            value={customHex}
            onChange={(e) => setCustomHex(e.target.value)}
            aria-label="Custom colour swatch"
            className="border-line h-9 w-12 cursor-pointer rounded border"
          />
          <button
            type="button"
            onClick={() => {
              addColor({ name: customName, hex: customHex });
              setCustomName('');
            }}
            className="border-ink inline-flex h-9 items-center gap-1 rounded border px-3 text-xs font-semibold uppercase"
          >
            <Plus className="size-3.5" /> Add
          </button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Sizes</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(SIZE_PRESETS) as (keyof typeof SIZE_PRESETS)[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => onSizes(sortSizes([...new Set([...sizes, ...SIZE_PRESETS[k]])]))}
              className="border-line hover:border-ink rounded border border-dashed px-3 py-1.5 text-xs"
            >
              + {PRESET_LABELS[k]}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {sizes.map((s) => (
            <span
              key={s}
              className="bg-mist inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-sm font-medium"
            >
              {s}
              <button
                type="button"
                aria-label={`Remove size ${s}`}
                onClick={() => onSizes(sizes.filter((x) => x !== s))}
                className="text-muted hover:text-ink"
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
          <input
            value={customSize}
            onChange={(e) => setCustomSize(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSize(customSize);
                setCustomSize('');
              }
            }}
            placeholder="Custom size + Enter"
            aria-label="Custom size"
            className="border-line h-8 w-40 rounded border px-2 text-sm"
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-sm font-medium">Stock by variant</p>
          <p className="text-muted text-xs">
            {variants.length} variants · {total} units
          </p>
        </div>
        <div className="border-line overflow-x-auto rounded border">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-mist text-muted text-left text-xs uppercase tracking-wider">
              <tr>
                <th className="p-2">Colour</th>
                <th className="p-2">Size</th>
                <th className="p-2">SKU</th>
                <th className="w-28 p-2">Stock</th>
                <th className="w-28 p-2" title="Leave blank to use the store default">
                  Low alert
                </th>
              </tr>
            </thead>
            <tbody className="divide-line divide-y">
              {variants.map((v, i) => {
                const firstOfColor = i === 0 || variants[i - 1]!.color !== v.color;
                return (
                  <tr
                    key={v.key}
                    className={cn(firstOfColor && i > 0 && 'border-t-line border-t-2')}
                  >
                    <td className="p-2 font-medium">{firstOfColor ? v.color : ''}</td>
                    <td className="p-2">{v.size}</td>
                    <td className="p-2">
                      <input
                        value={v.sku}
                        onChange={(e) => update(v.key, { sku: e.target.value.toUpperCase() })}
                        aria-label={`SKU for ${v.color} ${v.size}`}
                        className="border-line h-8 w-full rounded border px-2 font-mono text-xs"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min={0}
                        value={v.stock}
                        onChange={(e) =>
                          update(v.key, { stock: Math.max(0, Number(e.target.value) || 0) })
                        }
                        aria-label={`Stock for ${v.color} ${v.size}`}
                        className={cn(
                          'h-8 w-full rounded border px-2 tabular-nums',
                          v.stock === 0 ? 'border-danger/50 bg-danger/5' : 'border-line',
                        )}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min={0}
                        value={v.lowStockThreshold ?? ''}
                        placeholder="Default"
                        onChange={(e) =>
                          update(v.key, {
                            lowStockThreshold:
                              e.target.value === '' ? null : Math.max(0, Number(e.target.value)),
                          })
                        }
                        aria-label={`Low stock alert for ${v.color} ${v.size}`}
                        className="border-line h-8 w-full rounded border px-2 tabular-nums"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {variants.length > 1 && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            <label htmlFor="bulk-stock" className="text-muted">
              Set every variant to
            </label>
            <input
              id="bulk-stock"
              type="number"
              min={0}
              value={bulkStock}
              onChange={(e) => setBulkStock(e.target.value)}
              className="border-line h-8 w-20 rounded border px-2"
            />
            <button
              type="button"
              disabled={bulkStock === ''}
              className="border-ink rounded border px-2 py-1 font-semibold uppercase disabled:opacity-40"
              onClick={() => {
                onVariants(
                  variants.map((v) => ({
                    ...v,
                    stock: Math.max(0, Math.floor(Number(bulkStock))),
                  })),
                );
                setBulkStock('');
              }}
            >
              Apply
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
