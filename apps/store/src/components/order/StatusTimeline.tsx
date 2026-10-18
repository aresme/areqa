import { Check, X } from 'lucide-react';
import {
  ORDER_STATUS_DESCRIPTIONS,
  ORDER_STATUS_LABELS,
  ORDER_TIMELINE,
  formatDateTime,
  type OrderStatus,
  type StatusEvent,
} from '@areqa/shared';
import { cn } from '@/lib/cn';

export function StatusTimeline({
  status,
  history,
}: {
  status: OrderStatus;
  history: Pick<StatusEvent, 'status' | 'at'>[];
}) {
  const at = (s: OrderStatus) => history.find((h) => h.status === s)?.at;

  if (status === 'cancelled') {
    return (
      <div className="border-danger/30 flex gap-4 rounded-lg border p-5">
        <span className="bg-danger text-paper flex size-9 shrink-0 items-center justify-center rounded-full">
          <X className="size-4" aria-hidden />
        </span>
        <div>
          <p className="font-semibold">Cancelled</p>
          <p className="text-muted text-sm">
            {ORDER_STATUS_DESCRIPTIONS.cancelled} Contact us if you have questions.
          </p>
          <p className="text-muted mt-1 text-xs">{formatDateTime(at('cancelled'))}</p>
        </div>
      </div>
    );
  }

  const current = ORDER_TIMELINE.indexOf(status);
  return (
    <ol className="relative">
      {ORDER_TIMELINE.map((s, i) => {
        const done = i <= current;
        const isCurrent = i === current;
        return (
          <li
            key={s}
            className="relative flex gap-4 pb-8 last:pb-0"
            aria-current={isCurrent ? 'step' : undefined}
          >
            {i < ORDER_TIMELINE.length - 1 && (
              <span
                className={cn(
                  'absolute left-[17px] top-9 h-[calc(100%-2.25rem)] w-0.5',
                  i < current ? 'bg-ink' : 'bg-line',
                )}
                aria-hidden
              />
            )}
            <span
              className={cn(
                'relative flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold',
                done ? 'border-ink bg-ink text-paper' : 'border-line bg-paper text-muted',
                isCurrent && 'ring-mint ring-4',
              )}
            >
              {done ? <Check className="size-4" aria-hidden /> : i + 1}
            </span>
            <div className="pt-1.5">
              <p className={cn('font-semibold', !done && 'text-muted')}>{ORDER_STATUS_LABELS[s]}</p>
              {isCurrent && (
                <p className="text-muted mt-0.5 text-sm">{ORDER_STATUS_DESCRIPTIONS[s]}</p>
              )}
              {done && at(s) && (
                <p className="text-muted mt-0.5 text-xs">{formatDateTime(at(s))}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
