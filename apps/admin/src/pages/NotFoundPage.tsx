import { Compass } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export default function NotFoundPage() {
  return (
    <div className="card">
      <EmptyState
        icon={Compass}
        title="Page not found"
        body="This admin page doesn't exist. It may have moved."
        action={<ButtonLink to="/">Back to dashboard</ButtonLink>}
      />
    </div>
  );
}
