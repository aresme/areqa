import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max: number;
  size?: 'sm' | 'md';
  label?: string;
}

export function QuantityInput({
  value,
  onChange,
  min = 1,
  max,
  size = 'md',
  label = 'Quantity',
}: QuantityInputProps) {
  const btn = cn(
    'flex items-center justify-center transition-colors hover:bg-mist disabled:opacity-30',
    size === 'sm' ? 'size-8' : 'size-11',
  );
  return (
    <div
      className="border-line inline-flex items-center rounded border"
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        <Minus className="size-3.5" />
      </button>
      <output
        aria-live="polite"
        className={cn(
          'text-center font-semibold tabular-nums',
          size === 'sm' ? 'w-7 text-sm' : 'w-10',
        )}
      >
        {value}
      </output>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
