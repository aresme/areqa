import type { ProductColor } from '@areqa/shared';
import { colorHasStock, stockOf, type StockMap } from '@/features/catalog/variants';
import { cn } from '@/lib/cn';

interface VariantSelectorProps {
  colors: ProductColor[];
  sizes: string[];
  stock: StockMap | undefined;
  color: string;
  size: string | null;
  onColor: (color: string) => void;
  onSize: (size: string) => void;
  lowStockThreshold: number;
  onSizeGuide?: () => void;
  sizeError?: boolean;
}

export function VariantSelector({
  colors,
  sizes,
  stock,
  color,
  size,
  onColor,
  onSize,
  lowStockThreshold,
  onSizeGuide,
  sizeError,
}: VariantSelectorProps) {
  const selectedStock = size ? stockOf(stock, color, size) : null;
  const oneSize = sizes.length === 1;

  return (
    <div className="space-y-6">
      {colors.length > 0 && (
        <fieldset>
          <legend className="label mb-3">
            Colour:{' '}
            <span className="text-muted font-sans normal-case tracking-normal">{color}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => {
              const available = colorHasStock(stock, c.name, sizes);
              return (
                <label
                  key={c.name}
                  className="cursor-pointer"
                  title={available ? c.name : `${c.name} (sold out)`}
                >
                  <input
                    type="radio"
                    name="color"
                    value={c.name}
                    checked={c.name === color}
                    onChange={() => onColor(c.name)}
                    className="peer sr-only"
                  />
                  <span
                    className={cn(
                      'border-line peer-checked:ring-ink peer-focus-visible:ring-mint-strong relative flex size-10 items-center justify-center rounded-full border ring-offset-2 transition-shadow peer-checked:ring-2 peer-focus-visible:ring-2',
                      !available && 'opacity-40',
                    )}
                  >
                    <span
                      className="border-ink/10 size-8 rounded-full border"
                      style={{ backgroundColor: c.hex }}
                    />
                    {!available && (
                      <span className="bg-ink absolute h-px w-9 rotate-45" aria-hidden />
                    )}
                    <span className="sr-only">
                      {c.name}
                      {!available && ', sold out'}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {!oneSize && (
        <fieldset aria-describedby={sizeError ? 'size-error' : undefined}>
          <div className="mb-3 flex items-center justify-between">
            <legend className="label">
              Size
              {size && (
                <span className="text-muted font-sans normal-case tracking-normal">: {size}</span>
              )}
            </legend>
            {onSizeGuide && (
              <button
                type="button"
                onClick={onSizeGuide}
                className="hover:text-mint-deep text-xs font-medium underline underline-offset-4"
              >
                Size guide
              </button>
            )}
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(3.25rem,1fr))] gap-2">
            {sizes.map((s) => {
              const qty = stockOf(stock, color, s);
              const out = stock !== undefined && qty === 0;
              return (
                <label key={s} className={cn(out ? 'cursor-not-allowed' : 'cursor-pointer')}>
                  <input
                    type="radio"
                    name="size"
                    value={s}
                    checked={s === size}
                    disabled={out}
                    onChange={() => onSize(s)}
                    className="peer sr-only"
                  />
                  <span
                    className={cn(
                      'peer-checked:border-ink peer-checked:bg-mint peer-focus-visible:ring-mint-strong flex h-11 items-center justify-center rounded border text-sm font-medium transition-colors peer-focus-visible:ring-2',
                      out ? 'border-line text-muted line-through' : 'border-line hover:border-ink',
                      sizeError && !size && 'border-danger',
                    )}
                  >
                    {s}
                    {out && <span className="sr-only">, sold out</span>}
                  </span>
                </label>
              );
            })}
          </div>
          {sizeError && !size && (
            <p id="size-error" role="alert" className="text-danger-deep mt-2 text-sm">
              Please choose a size.
            </p>
          )}
        </fieldset>
      )}

      {selectedStock !== null && selectedStock > 0 && selectedStock <= lowStockThreshold && (
        <p className="text-mint-deep text-sm font-semibold" role="status">
          Only {selectedStock} left in {oneSize ? 'stock' : `size ${size}`}. Order soon.
        </p>
      )}
    </div>
  );
}
