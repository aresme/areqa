import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface RadioCardProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
}

export const RadioCard = forwardRef<HTMLInputElement, RadioCardProps>(function RadioCard(
  { title, description, aside, className, ...input },
  ref,
) {
  return (
    <label
      className={cn(
        'border-line has-[:checked]:border-ink has-[:checked]:bg-mint/30 has-[:focus-visible]:ring-mint-strong hover:border-ink/50 flex cursor-pointer gap-3 rounded border p-4 transition-colors has-[:focus-visible]:ring-2',
        className,
      )}
    >
      <input ref={ref} type="radio" className="peer sr-only" {...input} />
      <span
        className="border-ink/40 peer-checked:border-ink after:bg-ink mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 after:size-2.5 after:rounded-full after:opacity-0 peer-checked:after:opacity-100"
        aria-hidden
      />
      <span className="flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        {description && <span className="text-muted mt-1 block text-sm">{description}</span>}
      </span>
      {aside && <span className="shrink-0 text-sm font-semibold">{aside}</span>}
    </label>
  );
});
