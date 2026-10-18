import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'new' | 'sale' | 'low' | 'out' | 'neutral';

const tones: Record<Tone, string> = {
  new: 'bg-mint text-ink',
  sale: 'bg-mint-strong text-ink',
  low: 'bg-ink text-paper',
  out: 'bg-paper text-danger-deep border border-danger/40',
  neutral: 'bg-mist text-ink',
};

export function Badge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-1 text-[10px] font-semibold uppercase leading-none tracking-[0.12em]',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
