import { imageUrl } from '@areqa/shared';
import { cn } from '@/lib/cn';

/** Small admin thumbnail using Cloudinary/Unsplash transformations. */
export function Thumb({
  src,
  alt = '',
  size = 48,
  className,
}: {
  src?: string;
  alt?: string;
  size?: number;
  className?: string;
}) {
  if (!src)
    return (
      <div
        className={cn('bg-mist rounded', className)}
        style={{ width: size, height: size * 1.25 }}
        aria-hidden
      />
    );
  return (
    <img
      src={imageUrl(src, { width: size * 2, aspect: 0.8 })}
      alt={alt}
      loading="lazy"
      className={cn('bg-mist rounded object-cover', className)}
      style={{ width: size, height: size * 1.25 }}
    />
  );
}
