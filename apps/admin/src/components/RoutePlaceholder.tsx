/** Temporary route body used only until the page's phase is built. */
export function RoutePlaceholder({ title, phase }: { title: string; phase: number }) {
  return (
    <section>
      <p className="label text-mint-deep">Coming in phase {phase}</p>
      <h1 className="mt-2 text-2xl">{title}</h1>
    </section>
  );
}
