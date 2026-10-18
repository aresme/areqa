import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

interface StatTileProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  to?: string;
  tone?: 'default' | 'attention';
}

export function StatTile({ label, value, hint, icon: Icon, to, tone = 'default' }: StatTileProps) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <p className="label text-muted">{label}</p>
        <span
          className={cn(
            'flex size-8 items-center justify-center rounded-full',
            tone === 'attention' ? 'bg-[#FFF1C2]' : 'bg-mint',
          )}
        >
          <Icon className="size-4" aria-hidden />
        </span>
      </div>
      <p className="font-display mt-3 text-3xl font-bold tabular-nums">{value}</p>
      {hint && <p className="text-muted mt-1 text-xs">{hint}</p>}
    </>
  );
  const cls = 'card block p-5 transition-colors';
  return to ? (
    <Link to={to} className={cn(cls, 'hover:border-ink')}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}
