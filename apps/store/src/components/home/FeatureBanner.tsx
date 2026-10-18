import { motion } from 'framer-motion';
import type { FeatureBanner as Banner } from '@areqa/shared';
import { ButtonLink } from '@/components/ui/Button';
import { Img } from '@/components/ui/Img';

export function FeatureBanner({ banner }: { banner: Banner }) {
  return (
    <section
      aria-labelledby="feature-title"
      className="bg-mint grid overflow-hidden md:grid-cols-2"
    >
      <div className="relative aspect-[4/5] md:aspect-auto md:min-h-[640px]">
        <Img
          src={banner.image.url}
          alt={banner.image.alt ?? ''}
          sizes="(min-width:768px) 50vw, 100vw"
          className="absolute inset-0 size-full object-cover"
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
        className="flex flex-col justify-center px-6 py-14 sm:px-12 lg:px-20"
      >
        <p className="label mb-4">{banner.eyebrow}</p>
        <h2 id="feature-title" className="text-hero uppercase">
          {banner.headline}
        </h2>
        <p className="mt-6 max-w-md text-base leading-relaxed">{banner.body}</p>
        <div className="mt-10">
          <ButtonLink to={banner.cta.href} size="lg">
            {banner.cta.label}
          </ButtonLink>
        </div>
      </motion.div>
    </section>
  );
}
