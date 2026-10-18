import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  body?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, body, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <span className="bg-mint mb-5 flex size-16 items-center justify-center rounded-full">
        <Icon className="size-7" aria-hidden />
      </span>
      <h2 className="font-display text-xl font-bold uppercase">{title}</h2>
      {body && <p className="text-muted mt-2 max-w-sm text-sm">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
