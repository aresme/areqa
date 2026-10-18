import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
import { Field, Input } from '@/components/form/Field';
import { Seo } from '@/components/Seo';
import { Button } from '@/components/ui/Button';
import { resetPassword } from '@/features/auth/authService';
import { authErrorMessage } from '@/features/auth/errors';
import { rateLimit } from '@/lib/rateLimit';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'sent'>('idle');
  const [error, setError] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!rateLimit('reset', { max: 3, windowMs: 10 * 60_000 }))
      return setError('Too many requests. Try again in a few minutes.');
    setState('busy');
    try {
      await resetPassword(email);
      setState('sent');
    } catch (err) {
      // Don't reveal whether an account exists.
      if ((err as { code?: string }).code === 'auth/user-not-found') setState('sent');
      else {
        setError(authErrorMessage(err));
        setState('idle');
      }
    }
  };

  return (
    <AuthShell eyebrow="Account help" title="Reset password">
      <Seo title="Reset password" noIndex />
      {state === 'sent' ? (
        <div className="bg-mist rounded-lg p-6" role="status">
          <MailCheck className="size-6" aria-hidden />
          <p className="mt-3 font-semibold">Check your inbox</p>
          <p className="text-muted mt-1 text-sm">
            If an account exists for {email}, you will receive a link to reset your password in a
            few minutes.
          </p>
          <Link
            to="/login"
            className="mt-5 inline-block text-sm font-semibold underline underline-offset-4"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <p className="text-muted text-sm">
            Enter the email you signed up with and we will send you a reset link.
          </p>
          <Field label="Email" error={error || undefined}>
            {(a) => (
              <Input
                {...a}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                inputMode="email"
                required
              />
            )}
          </Field>
          <Button type="submit" size="lg" block disabled={state === 'busy' || !email}>
            {state === 'busy' ? 'Sending…' : 'Send reset link'}
          </Button>
          <p className="text-center text-sm">
            <Link to="/login" className="underline underline-offset-4">
              Back to sign in
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
