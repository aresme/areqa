import { useState, type FormEvent } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { subscribe } from '@/features/content/newsletter';
import { toast } from '@/features/ui/toastStore';
import { rateLimit } from '@/lib/rateLimit';
import { cn } from '@/lib/cn';

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function NewsletterForm({
  source,
  tone = 'light',
}: {
  source: string;
  tone?: 'light' | 'dark';
}) {
  const [email, setEmail] = useState('');
  const [trap, setTrap] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle');
  const [error, setError] = useState('');
  const dark = tone === 'dark';

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (trap) return setState('done'); // honeypot: bots fill hidden fields
    if (!EMAIL.test(email.trim())) return setError('Enter a valid email address.');
    if (!rateLimit('newsletter', { max: 3, windowMs: 10 * 60_000 }))
      return setError('Too many attempts. Try again in a few minutes.');
    setError('');
    setState('busy');
    try {
      await subscribe(email, source);
      setState('done');
      toast.success('You are on the list', { description: 'Watch your inbox for new drops.' });
    } catch {
      setState('idle');
      setError('Could not subscribe right now. Please try again.');
    }
  };

  if (state === 'done') {
    return (
      <p
        className={cn(
          'flex items-center gap-2 text-sm font-medium',
          dark ? 'text-mint' : 'text-mint-deep',
        )}
        role="status"
      >
        <Check className="size-4" /> Thanks for subscribing!
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="w-full">
      <div
        className={cn(
          'flex items-center border-b',
          dark ? 'border-paper/40 focus-within:border-mint' : 'border-ink',
        )}
      >
        <label htmlFor={`nl-${source}`} className="sr-only">
          Email address
        </label>
        <input
          id={`nl-${source}`}
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `nl-${source}-err` : undefined}
          className={cn(
            'h-12 w-full bg-transparent text-sm outline-none focus-visible:ring-0',
            dark ? 'placeholder:text-paper/50' : 'placeholder:text-muted',
          )}
        />
        <input
          tabIndex={-1}
          autoComplete="off"
          value={trap}
          onChange={(e) => setTrap(e.target.value)}
          className="hidden"
          aria-hidden
          name="company"
        />
        <button
          type="submit"
          disabled={state === 'busy'}
          aria-label="Subscribe"
          className={cn(
            'flex size-12 shrink-0 items-center justify-center transition-colors',
            dark ? 'hover:text-mint' : 'hover:text-mint-deep',
          )}
        >
          <ArrowRight className="size-5" />
        </button>
      </div>
      {error && (
        <p
          id={`nl-${source}-err`}
          className={cn('mt-2 text-xs', dark ? 'text-[#FF9C9C]' : 'text-danger-deep')}
        >
          {error}
        </p>
      )}
    </form>
  );
}
