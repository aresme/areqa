import { cn } from '@/lib/cn';

export type Variant = 'primary' | 'secondary' | 'ghost' | 'mint';
export type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded font-semibold uppercase tracking-[0.08em] transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50';

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-paper hover:bg-mint hover:text-ink',
  secondary: 'border border-ink bg-paper text-ink hover:bg-ink hover:text-paper',
  ghost: 'text-ink hover:bg-mist',
  mint: 'bg-mint text-ink hover:bg-ink hover:text-paper',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-[11px]',
  md: 'h-11 px-6 text-xs',
  lg: 'h-14 px-8 text-[13px]',
};

export interface ButtonStyleProps {
  variant?: Variant;
  size?: Size;
  block?: boolean;
}

export function buttonClass({ variant = 'primary', size = 'md', block }: ButtonStyleProps = {}) {
  return cn(base, variants[variant], sizes[size], block && 'w-full');
}
