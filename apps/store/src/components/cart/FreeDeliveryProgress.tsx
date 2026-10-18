import { Truck } from 'lucide-react';
import { formatKES } from '@areqa/shared';
import { useSettings } from '@/features/content/hooks';

export function FreeDeliveryProgress({ subtotal }: { subtotal: number }) {
  const { settings } = useSettings();
  const threshold = settings.freeDeliveryThreshold;
  if (!threshold) return null;
  const remaining = Math.max(0, threshold - subtotal);
  const pct = Math.min(100, Math.round((subtotal / threshold) * 100));
  return (
    <div className="bg-mist rounded p-4">
      <p className="flex items-center gap-2 text-sm">
        <Truck className="size-4 shrink-0" aria-hidden />
        {remaining > 0 ? (
          <span>
            Add <strong>{formatKES(remaining)}</strong> more for <strong>free delivery</strong>
          </span>
        ) : (
          <span className="text-mint-deep font-semibold">You have unlocked free delivery</span>
        )}
      </p>
      <div
        className="bg-line mt-3 h-1.5 overflow-hidden rounded-full"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label="Progress to free delivery"
      >
        <div
          className="bg-mint-strong h-full rounded-full transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
