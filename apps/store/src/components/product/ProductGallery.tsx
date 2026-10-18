import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { imageUrl, type ProductImage } from '@areqa/shared';
import { Img } from '@/components/ui/Img';
import { cn } from '@/lib/cn';

/** Desktop: thumbnails + hover zoom. Mobile: swipeable scroll-snap strip with dots. */
export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const strip = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActive(0);
    strip.current?.scrollTo({ left: 0 });
  }, [images]);

  const onStripScroll = () => {
    const el = strip.current;
    if (el) setActive(Math.round(el.scrollLeft / el.clientWidth));
  };

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
  };

  if (images.length === 0) return <div className="aspect-product bg-mist rounded" />;
  const current = images[Math.min(active, images.length - 1)]!;

  return (
    <div>
      {/* Mobile / tablet */}
      <div className="relative -mx-4 sm:-mx-6 lg:hidden">
        <div
          ref={strip}
          onScroll={onStripScroll}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label={`${name} images`}
          role="region"
          tabIndex={0}
        >
          {images.map((img, i) => (
            <div key={img.url} className="aspect-product w-full shrink-0 snap-center">
              <Img
                src={img.url}
                alt={img.alt ?? `${name} image ${i + 1}`}
                aspect={0.8}
                priority={i === 0}
                sizes="100vw"
                className="size-full object-cover"
              />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5" aria-hidden>
            {images.map((img, i) => (
              <span
                key={img.url}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === active ? 'bg-ink w-5' : 'bg-ink/30 w-1.5',
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden gap-4 lg:grid lg:grid-cols-[72px_1fr]">
        <ul className="flex flex-col gap-3" aria-label="Choose image">
          {images.map((img, i) => (
            <li key={img.url}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === active}
                className={cn(
                  'aspect-product block w-full overflow-hidden rounded border-2 transition-colors',
                  i === active ? 'border-ink' : 'hover:border-line border-transparent',
                )}
              >
                <Img
                  src={img.url}
                  alt=""
                  aspect={0.8}
                  sizes="72px"
                  maxWidth={320}
                  className="size-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
        <div
          className="aspect-product bg-mist relative cursor-zoom-in overflow-hidden rounded"
          onMouseMove={onMove}
          onMouseLeave={() => setZoom(null)}
        >
          <Img
            key={current.url}
            src={current.url}
            alt={current.alt ?? name}
            aspect={0.8}
            priority
            sizes="(min-width:1280px) 640px, 50vw"
            className="size-full object-cover"
          />
          {zoom && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-no-repeat"
              style={{
                backgroundImage: `url(${imageUrl(current.url, { width: 1920 })})`,
                backgroundSize: '220%',
                backgroundPosition: `${zoom.x}% ${zoom.y}%`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
