import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type PillTone = 'mint' | 'ink' | 'mist' | 'danger' | 'warn' | 'outline';

const tones: Record<PillTone, string> = {
  mint: 'bg-mint text-ink',
  ink: 'bg-ink text-paper',
  mist: 'bg-mist text-ink border border-line',
  danger: 'bg-danger/10 text-danger-deep',
  warn: 'bg-[#FFF1C2] text-[#7A5A00]',
  outline: 'border border-line text-muted',
};

export function StatusPill({
  tone = 'mist',
  children,
  className,
}: {
  tone?: PillTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
