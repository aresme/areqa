import { formatKES, type KES } from '@areqa/shared';
import { cn } from '@/lib/cn';

export function Price({
  price,
  compareAt,
  className,
}: {
  price: KES;
  compareAt?: KES | null;
  className?: string;
}) {
  const onSale = Boolean(compareAt && compareAt > price);
  return (
    <p className={cn('flex flex-wrap items-baseline gap-x-2', className)}>
      <span className={cn('font-semibold', onSale && 'text-mint-deep')}>
        <span className="sr-only">{onSale ? 'Sale price ' : 'Price '}</span>
        {formatKES(price)}
      </span>
      {onSale && (
        <s className="text-muted text-sm">
          <span className="sr-only">Was </span>
          {formatKES(compareAt!)}
        </s>
      )}
    </p>
  );
}
