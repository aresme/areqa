import { cn } from '@/lib/cn';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('bg-mist relative overflow-hidden rounded', className)}>
      <div className="animate-shimmer via-paper/70 absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent" />
    </div>
  );
}
