import { Seo } from './Seo';

/** Temporary route body used only until the page's phase is built. */
export function RoutePlaceholder({ title, phase }: { title: string; phase: number }) {
  return (
    <section className="container-page py-20">
      <Seo title={title} noIndex />
      <p className="label text-mint-deep">Coming in phase {phase}</p>
      <h1 className="text-display mt-3 uppercase">{title}</h1>
    </section>
  );
}
