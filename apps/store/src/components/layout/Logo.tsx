import { Link } from 'react-router-dom';
import { imageUrl } from '@areqa/shared';
import { useSettings } from '@/features/content/hooks';
import { cn } from '@/lib/cn';

export function Logo({ className, inverted }: { className?: string; inverted?: boolean }) {
  const { settings } = useSettings();
  return (
    <Link
      to="/"
      className={cn('inline-flex items-center', className)}
      aria-label={`${settings.storeName} home`}
    >
      {settings.logo?.url ? (
        <img
          src={imageUrl(settings.logo.url, { width: 240 })}
          alt={settings.storeName}
          className={cn('h-7 w-auto', inverted && 'invert')}
        />
      ) : (
        <span className="font-display text-2xl font-bold uppercase leading-none tracking-[-0.04em]">
          {settings.storeName}
          <span className="text-mint-strong">.</span>
        </span>
      )}
    </Link>
  );
}
