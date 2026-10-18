import { Quote } from 'lucide-react';
import type { Testimonial } from '@areqa/shared';
import { SectionHeader } from '@/components/SectionHeader';
import { Stars } from '@/components/ui/Stars';

export function Testimonials({ items }: { items: Testimonial[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="reviews-title" className="bg-mist py-16 sm:py-24">
      <div className="container-page">
        <SectionHeader id="reviews-title" eyebrow="Reviews" title="Loved across Kenya" />
        <ul className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
          {items.map((t) => (
            <li key={t.id} className="w-[82%] shrink-0 snap-start sm:w-auto">
              <figure className="bg-paper flex h-full flex-col rounded-lg p-6">
                <Quote className="text-mint-strong size-6" aria-hidden />
                <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed">
                  “{t.quote}”
                </blockquote>
                <figcaption className="border-line mt-6 flex items-center justify-between gap-3 border-t pt-4">
                  <span>
                    <span className="block text-sm font-semibold">{t.name}</span>
                    <span className="text-muted block text-xs">{t.location}</span>
                  </span>
                  <Stars value={t.rating} />
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
