import { Plus, Star } from 'lucide-react';
import type { HomeContent, HeroSlide, LookbookItem, Testimonial } from '@areqa/shared';
import { FormCard } from '@/components/products/FormCard';
import { SingleImageUpload } from '@/components/products/SingleImageUpload';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Toggle } from '@/components/ui/Toggle';
import { newId } from '@/features/content/api';
import { ListControls } from './ListControls';
import { move } from './listOps';

type Set = (next: HomeContent) => void;

const text = (
  label: string,
  value: string,
  onChange: (v: string) => void,
  opts: { hint?: string; area?: boolean; className?: string; placeholder?: string } = {},
) => (
  <Field label={label} hint={opts.hint} className={opts.className}>
    {(a) =>
      opts.area ? (
        <textarea
          {...a}
          rows={3}
          value={value}
          placeholder={opts.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          {...a}
          value={value}
          placeholder={opts.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )
    }
  </Field>
);

export function AnnouncementEditor({ home, set }: { home: HomeContent; set: Set }) {
  const a = home.announcement;
  return (
    <FormCard title="Announcement bar" description="The mint strip at the very top of every page.">
      <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
        {text('Message', a.text, (t) => set({ ...home, announcement: { ...a, text: t } }), {
          placeholder: 'Free delivery on orders over KSh 5,000',
        })}
        {text('Link (optional)', a.href, (href) => set({ ...home, announcement: { ...a, href } }), {
          placeholder: '/shipping',
        })}
      </div>
      <div className="mt-4">
        <Toggle
          checked={a.isActive}
          onChange={(isActive) => set({ ...home, announcement: { ...a, isActive } })}
          label="Show announcement"
        />
      </div>
    </FormCard>
  );
}

const emptySlide = (): HeroSlide => ({
  id: newId(),
  eyebrow: '',
  headline: '',
  subtext: '',
  image: { url: '', publicId: '', alt: '' },
  primaryCta: { label: 'Shop now', href: '/shop' },
  secondaryCta: null,
});

export function HeroEditor({ home, set }: { home: HomeContent; set: Set }) {
  const slides = home.heroSlides;
  const update = (i: number, s: HeroSlide) =>
    set({ ...home, heroSlides: slides.map((x, j) => (j === i ? s : x)) });
  return (
    <FormCard
      title="Hero slides"
      description="Full-width slideshow at the top of the home page. The first slide's headline is the page's main heading."
      aside={
        <Button
          size="sm"
          variant="secondary"
          onClick={() => set({ ...home, heroSlides: [...slides, emptySlide()] })}
        >
          <Plus className="size-4" /> Slide
        </Button>
      }
    >
      {slides.length === 0 && (
        <p className="text-muted text-sm">No slides. The hero is hidden until you add one.</p>
      )}
      <ol className="space-y-6">
        {slides.map((s, i) => (
          <li key={s.id} className="border-line rounded border p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="label">Slide {i + 1}</p>
              <ListControls
                index={i}
                count={slides.length}
                label={`slide ${i + 1}`}
                onMove={(to) => set({ ...home, heroSlides: move(slides, i, to) })}
                onRemove={() => set({ ...home, heroSlides: slides.filter((_, j) => j !== i) })}
              />
            </div>
            <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
              <div className="space-y-3">
                <SingleImageUpload
                  label="Image (landscape, 2400px wide)"
                  aspect={1.6}
                  folder="hero"
                  value={s.image.url ? s.image : null}
                  onChange={(img) => update(i, { ...s, image: img ?? { url: '', publicId: '' } })}
                />
                {text(
                  'Image description',
                  s.image.alt ?? '',
                  (alt) => update(i, { ...s, image: { ...s.image, alt } }),
                  { hint: 'For screen readers and SEO' },
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {text('Small label', s.eyebrow, (eyebrow) => update(i, { ...s, eyebrow }), {
                  placeholder: 'New season',
                })}
                {text('Headline', s.headline, (headline) => update(i, { ...s, headline }), {
                  placeholder: 'Layer up for the short rains',
                })}
                {text('Subtext', s.subtext, (subtext) => update(i, { ...s, subtext }), {
                  className: 'sm:col-span-2',
                })}
                {text('Main button text', s.primaryCta.label, (label) =>
                  update(i, { ...s, primaryCta: { ...s.primaryCta, label } }),
                )}
                {text(
                  'Main button link',
                  s.primaryCta.href,
                  (href) => update(i, { ...s, primaryCta: { ...s.primaryCta, href } }),
                  { placeholder: '/shop/new-in' },
                )}
                {text(
                  'Second button text',
                  s.secondaryCta?.label ?? '',
                  (label) =>
                    update(i, {
                      ...s,
                      secondaryCta:
                        label || s.secondaryCta?.href
                          ? { label, href: s.secondaryCta?.href ?? '' }
                          : null,
                    }),
                  { hint: 'Leave blank for one button' },
                )}
                {text('Second button link', s.secondaryCta?.href ?? '', (href) =>
                  update(i, { ...s, secondaryCta: { label: s.secondaryCta?.label ?? '', href } }),
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </FormCard>
  );
}

export function BannerEditor({ home, set }: { home: HomeContent; set: Set }) {
  const b = home.featureBanner;
  const up = (patch: Partial<typeof b>) => set({ ...home, featureBanner: { ...b, ...patch } });
  return (
    <FormCard
      title="Featured collection banner"
      description="Split image + text section in the middle of the home page."
    >
      <div className="grid gap-4 lg:grid-cols-[200px_1fr]">
        <SingleImageUpload
          label="Image (portrait)"
          aspect={0.8}
          folder="banners"
          value={b.image.url ? b.image : null}
          onChange={(img) => up({ image: img ?? { url: '', publicId: '' } })}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {text('Small label', b.eyebrow, (eyebrow) => up({ eyebrow }))}
          {text('Headline', b.headline, (headline) => up({ headline }))}
          {text('Body', b.body, (body) => up({ body }), { area: true, className: 'sm:col-span-2' })}
          {text('Button text', b.cta.label, (label) => up({ cta: { ...b.cta, label } }))}
          {text('Button link', b.cta.href, (href) => up({ cta: { ...b.cta, href } }), {
            placeholder: '/shop/nairobi-nights',
          })}
        </div>
      </div>
    </FormCard>
  );
}

export function NewsletterEditor({ home, set }: { home: HomeContent; set: Set }) {
  const n = home.newsletter;
  return (
    <FormCard title="Newsletter section">
      <div className="grid gap-3 sm:grid-cols-2">
        {text('Headline', n.headline, (headline) =>
          set({ ...home, newsletter: { ...n, headline } }),
        )}
        {text('Body', n.body, (body) => set({ ...home, newsletter: { ...n, body } }))}
      </div>
    </FormCard>
  );
}

export function LookbookEditor({ home, set }: { home: HomeContent; set: Set }) {
  const items = home.lookbook;
  const update = (i: number, it: LookbookItem) =>
    set({ ...home, lookbook: items.map((x, j) => (j === i ? it : x)) });
  return (
    <FormCard
      title="Lookbook"
      description="Instagram-style square grid. Six images look best."
      aside={
        <Button
          size="sm"
          variant="secondary"
          onClick={() =>
            set({
              ...home,
              lookbook: [
                ...items,
                { id: newId(), image: { url: '', publicId: '' }, caption: '', href: '/shop' },
              ],
            })
          }
        >
          <Plus className="size-4" /> Image
        </Button>
      }
    >
      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((it, i) => (
          <li key={it.id} className="border-line space-y-3 rounded border p-3">
            <div className="flex justify-between">
              <span className="label">#{i + 1}</span>
              <ListControls
                index={i}
                count={items.length}
                label={`lookbook image ${i + 1}`}
                onMove={(to) => set({ ...home, lookbook: move(items, i, to) })}
                onRemove={() => set({ ...home, lookbook: items.filter((_, j) => j !== i) })}
              />
            </div>
            <SingleImageUpload
              label="Image"
              aspect={1}
              folder="lookbook"
              value={it.image.url ? it.image : null}
              onChange={(img) => update(i, { ...it, image: img ?? { url: '', publicId: '' } })}
            />
            {text('Caption', it.caption, (caption) => update(i, { ...it, caption }))}
            {text('Links to', it.href, (href) => update(i, { ...it, href }))}
          </li>
        ))}
      </ul>
    </FormCard>
  );
}

export function TestimonialsEditor({ home, set }: { home: HomeContent; set: Set }) {
  const items = home.testimonials;
  const update = (i: number, t: Testimonial) =>
    set({ ...home, testimonials: items.map((x, j) => (j === i ? t : x)) });
  return (
    <FormCard
      title="Testimonials"
      description="Shown in the 'Loved across Kenya' section. Use real customer words (with permission)."
      aside={
        <Button
          size="sm"
          variant="secondary"
          onClick={() =>
            set({
              ...home,
              testimonials: [
                ...items,
                { id: newId(), name: '', location: '', quote: '', rating: 5 },
              ],
            })
          }
        >
          <Plus className="size-4" /> Testimonial
        </Button>
      }
    >
      <ul className="space-y-4">
        {items.map((t, i) => (
          <li
            key={t.id}
            className="border-line grid gap-3 rounded border p-4 sm:grid-cols-[1fr_1fr_auto]"
          >
            {text('Name', t.name, (name) => update(i, { ...t, name }))}
            {text('Town', t.location, (location) => update(i, { ...t, location }))}
            <div className="flex items-start justify-end pt-6">
              <ListControls
                index={i}
                count={items.length}
                label={`testimonial ${i + 1}`}
                onMove={(to) => set({ ...home, testimonials: move(items, i, to) })}
                onRemove={() => set({ ...home, testimonials: items.filter((_, j) => j !== i) })}
              />
            </div>
            {text('Quote', t.quote, (quote) => update(i, { ...t, quote }), {
              area: true,
              className: 'sm:col-span-2',
            })}
            <fieldset>
              <legend className="mb-1.5 text-sm font-medium">Rating</legend>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => update(i, { ...t, rating: n })}
                    aria-label={`${n} stars`}
                    aria-pressed={t.rating === n}
                  >
                    <Star
                      className={`size-6 ${n <= t.rating ? 'fill-ink text-ink' : 'text-line'}`}
                    />
                  </button>
                ))}
              </div>
            </fieldset>
          </li>
        ))}
      </ul>
    </FormCard>
  );
}
