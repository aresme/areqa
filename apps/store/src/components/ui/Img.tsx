import { useCallback, useState, type ImgHTMLAttributes } from 'react';
import { imageSrcSet, imageUrl } from '@areqa/shared';
import { cn } from '@/lib/cn';

interface ImgProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  src: string;
  alt: string;
  /** Width/height ratio for cropping, e.g. 0.8 for the 4:5 product ratio. */
  aspect?: number;
  sizes?: string;
  priority?: boolean;
  maxWidth?: number;
}

/** Responsive, lazy image with Cloudinary/Unsplash transformations and a soft fade-in. */
export function Img({
  src,
  alt,
  aspect,
  sizes = '100vw',
  priority,
  maxWidth = 1920,
  className,
  ...rest
}: ImgProps) {
  const [loaded, setLoaded] = useState(false);
  // Images served from cache can finish before React attaches onLoad; check on mount too.
  const ref = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete && node.naturalWidth > 0) setLoaded(true);
  }, []);
  if (!src) return <div className={cn('bg-mist', className)} aria-hidden />;
  return (
    <img
      ref={ref}
      src={imageUrl(src, { width: 828, aspect })}
      srcSet={imageSrcSet(src, { aspect }, maxWidth)}
      sizes={sizes}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      // React 18 only knows the lowercase attribute.
      {...{ fetchpriority: priority ? 'high' : undefined }}
      onLoad={() => setLoaded(true)}
      className={cn(
        'bg-mist transition-opacity duration-500',
        loaded || priority ? 'opacity-100' : 'opacity-0',
        className,
      )}
      {...rest}
    />
  );
}
