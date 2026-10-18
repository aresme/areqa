import type { StoreSettings } from '@areqa/shared';

/** Simple brand glyphs (lucide dropped brand icons). */
const paths: Record<keyof StoreSettings['social'], string> = {
  instagram:
    'M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 3.9 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2zm0 4.7a5.1 5.1 0 1 0 0 10.2 5.1 5.1 0 0 0 0-10.2zm0 8.4a3.3 3.3 0 1 1 0-6.6 3.3 3.3 0 0 1 0 6.6zm5.3-9.8a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z',
  tiktok:
    'M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.8 5.8 0 1 0 4.9 5.7V9.1a7.4 7.4 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6z',
  facebook:
    'M13.5 21v-7.7h2.6l.4-3h-3V8.4c0-.9.3-1.5 1.5-1.5h1.6V4.2c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1z',
  x: 'M17.8 3h3.1l-6.8 7.7 8 10.3h-6.2l-4.9-6.3L5.4 21H2.3l7.2-8.3L1.8 3h6.4l4.4 5.8L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z',
};

const labels: Record<keyof StoreSettings['social'], string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  x: 'X (Twitter)',
};

export function SocialIcons({ social }: { social: StoreSettings['social'] }) {
  const entries = (Object.keys(paths) as (keyof typeof paths)[]).filter((k) => social[k]);
  if (entries.length === 0) return null;
  return (
    <ul className="flex gap-2">
      {entries.map((k) => (
        <li key={k}>
          <a
            href={social[k]}
            target="_blank"
            rel="noreferrer"
            aria-label={labels[k]}
            className="border-paper/20 hover:border-mint hover:bg-mint hover:text-ink flex size-10 items-center justify-center rounded-full border transition-colors"
          >
            <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden>
              <path d={paths[k]} />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
