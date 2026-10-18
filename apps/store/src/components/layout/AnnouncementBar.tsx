import { Link } from 'react-router-dom';
import { useHomeContent } from '@/features/content/hooks';

export function AnnouncementBar() {
  const { data } = useHomeContent();
  const a = data?.announcement;
  if (!a?.isActive || !a.text) return null;
  const text = <span className="truncate">{a.text}</span>;
  return (
    <div className="bg-mint text-ink">
      <div className="container-page flex h-9 items-center justify-center text-center text-xs font-medium tracking-wide">
        {a.href ? (
          <Link to={a.href} className="truncate underline-offset-4 hover:underline">
            {text}
          </Link>
        ) : (
          text
        )}
      </div>
    </div>
  );
}
