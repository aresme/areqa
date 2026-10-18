import { NewsletterForm } from '@/components/NewsletterForm';

export function NewsletterSection({ headline, body }: { headline: string; body: string }) {
  return (
    <section aria-labelledby="newsletter-title" className="bg-ink text-paper">
      <div className="container-page grid gap-8 py-16 sm:py-20 md:grid-cols-2 md:items-end">
        <div>
          <p className="label text-mint mb-3">Newsletter</p>
          <h2 id="newsletter-title" className="text-display uppercase">
            {headline}
          </h2>
          <p className="text-paper/70 mt-4 max-w-md">{body}</p>
        </div>
        <div className="md:pb-2">
          <NewsletterForm source="home" tone="dark" />
        </div>
      </div>
    </section>
  );
}
