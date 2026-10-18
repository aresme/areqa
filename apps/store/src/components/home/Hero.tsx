import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import type { HeroSlide } from '@areqa/shared';
import { ButtonLink } from '@/components/ui/Button';
import { Img } from '@/components/ui/Img';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';

const INTERVAL = 6500;

export function Hero({ slides, loading }: { slides: HeroSlide[]; loading?: boolean }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const count = slides.length;
  const go = useCallback((n: number) => setIndex((n + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || paused || reduce) return;
    const t = window.setTimeout(() => go(index + 1), INTERVAL);
    return () => window.clearTimeout(t);
  }, [index, paused, reduce, count, go]);

  if (loading) return <Skeleton className="h-[78svh] min-h-[520px] w-full rounded-none" />;
  if (count === 0) return null;
  const slide = slides[index]!;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      className="bg-ink text-paper relative h-[78svh] min-h-[520px] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={slide.id}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <Img
            src={slide.image.url}
            alt={slide.image.alt ?? ''}
            priority={index === 0}
            sizes="100vw"
            className="size-full object-cover object-[center_25%]"
          />
          <div
            className="from-ink/80 via-ink/25 to-ink/5 absolute inset-0 bg-gradient-to-t"
            aria-hidden
          />
        </motion.div>
      </AnimatePresence>

      <div className="container-page relative flex h-full flex-col justify-end pb-16 sm:pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="max-w-3xl"
            aria-live={paused ? 'polite' : 'off'}
          >
            {slide.eyebrow && (
              <p className="label bg-mint text-ink mb-4 inline-block px-2 py-1">{slide.eyebrow}</p>
            )}
            {index === 0 ? (
              <h1 className="text-hero uppercase">{slide.headline}</h1>
            ) : (
              <p className="font-display text-hero font-bold uppercase">{slide.headline}</p>
            )}
            {slide.subtext && (
              <p className="text-paper/85 mt-5 max-w-md text-base sm:text-lg">{slide.subtext}</p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to={slide.primaryCta.href} variant="mint" size="lg">
                {slide.primaryCta.label}
              </ButtonLink>
              {slide.secondaryCta && (
                <ButtonLink
                  to={slide.secondaryCta.href}
                  size="lg"
                  className="border-paper text-paper hover:bg-paper hover:text-ink border bg-transparent"
                >
                  {slide.secondaryCta.label}
                </ButtonLink>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {count > 1 && (
          <div className="absolute bottom-6 right-4 flex items-center gap-2 sm:right-6 lg:right-8">
            <div className="mr-2 flex gap-1.5">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Show slide ${i + 1} of ${count}`}
                  aria-current={i === index}
                  className="group py-3"
                >
                  <span
                    className={cn(
                      'block h-0.5 transition-all duration-500',
                      i === index ? 'bg-mint w-10' : 'bg-paper/50 group-hover:bg-paper w-5',
                    )}
                  />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}
              className="border-paper/40 hover:bg-paper hover:text-ink flex size-9 items-center justify-center rounded-full border"
            >
              {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous slide"
              className="border-paper/40 hover:bg-paper hover:text-ink hidden size-9 items-center justify-center rounded-full border sm:flex"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next slide"
              className="border-paper/40 hover:bg-paper hover:text-ink hidden size-9 items-center justify-center rounded-full border sm:flex"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
