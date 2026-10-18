import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/cn';

const control =
  'w-full rounded border bg-paper px-3.5 text-[15px] transition-colors placeholder:text-muted/70 hover:border-ink/40 focus:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-strong focus-visible:ring-offset-0 disabled:bg-mist';

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  className?: string;
  children: (props: {
    id: string;
    'aria-invalid': boolean;
    'aria-describedby'?: string;
    className: string;
  }) => ReactNode;
}

/** Label + control + hint/error with correct ARIA wiring. */
export function Field({ label, error, hint, optional, className, children }: FieldProps) {
  const id = useId();
  const described = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-1.5 flex items-baseline justify-between text-sm font-medium"
      >
        {label}
        {optional && <span className="text-muted text-xs font-normal">Optional</span>}
      </label>
      {children({
        id,
        'aria-invalid': Boolean(error),
        'aria-describedby': described,
        className: cn(control, error ? 'border-danger' : 'border-line'),
      })}
      {error ? (
        <p id={`${id}-err`} className="text-danger-deep mt-1.5 text-xs" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-muted mt-1.5 text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...p }, ref) {
    return <input ref={ref} className={cn('h-12', className)} {...p} />;
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, ...p }, ref) {
    return <select ref={ref} className={cn('h-12 cursor-pointer pr-8', className)} {...p} />;
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...p }, ref) {
  return <textarea ref={ref} className={cn('min-h-24 py-3', className)} {...p} />;
});
