import { CloudOff } from 'lucide-react';
import { firebase } from '@/lib/firebase';
import { Button } from './Button';
import { EmptyState } from './EmptyState';

/** Friendly failure state for data-driven sections. */
export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon={CloudOff}
      title={firebase ? 'Something went wrong' : 'Store not connected'}
      body={
        firebase
          ? 'We could not load this section. Check your connection and try again.'
          : 'Add your Firebase keys to apps/store/.env to load products.'
      }
      action={
        onRetry && firebase ? (
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        ) : undefined
      }
    />
  );
}
