import { useState, type FormEvent } from 'react';
import { Tag, X } from 'lucide-react';
import { formatKES, type DiscountCheck } from '@areqa/shared';
import { useAppliedDiscount } from '@/features/checkout/discount';

export function DiscountField({
  check,
  loading,
}: {
  check: DiscountCheck | null;
  loading: boolean;
}) {
  const { code, apply, clear } = useAppliedDiscount();
  const [value, setValue] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim()) apply(value);
    setValue('');
  };

  if (code) {
    return (
      <div>
        <div className="bg-mist flex items-center justify-between gap-3 rounded px-3 py-2.5 text-sm">
          <span className="flex items-center gap-2 font-semibold">
            <Tag className="size-4" aria-hidden /> {code}
          </span>
          <button
            type="button"
            onClick={clear}
            className="text-muted hover:text-ink"
            aria-label={`Remove code ${code}`}
          >
            <X className="size-4" />
          </button>
        </div>
        <p
          className={`mt-1.5 text-xs ${check && !check.ok ? 'text-danger-deep' : 'text-mint-deep'}`}
          role="status"
        >
          {loading
            ? 'Checking code…'
            : check?.ok
              ? `You save ${formatKES(check.amount)}`
              : check?.reason}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <label htmlFor="discount-code" className="sr-only">
        Discount code
      </label>
      <input
        id="discount-code"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Discount code"
        autoComplete="off"
        className="border-line focus:border-ink h-11 min-w-0 flex-1 rounded border px-3 text-sm uppercase placeholder:normal-case"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="border-ink hover:bg-ink hover:text-paper h-11 rounded border px-4 text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-40"
      >
        Apply
      </button>
    </form>
  );
}
