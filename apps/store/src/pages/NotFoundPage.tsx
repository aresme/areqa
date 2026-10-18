import { Seo } from '@/components/Seo';
import { ButtonLink } from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <section className="container-page flex min-h-[60vh] flex-col items-start justify-center py-20">
      <Seo title="Page not found" noIndex />
      <p className="label text-mint-deep">Error 404</p>
      <h1 className="text-hero mt-4 uppercase">
        Lost in
        <br />
        <span className="bg-mint px-2">the rails</span>
      </h1>
      <p className="text-muted mt-6 max-w-md">
        The page you are looking for has moved, sold out, or never existed. Let&apos;s get you back
        to something good.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink to="/shop">Shop all</ButtonLink>
        <ButtonLink to="/" variant="secondary">
          Back home
        </ButtonLink>
      </div>
    </section>
  );
}
