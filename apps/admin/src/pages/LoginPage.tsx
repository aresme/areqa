import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { adminSignIn, useAdminAuth } from '@/features/auth/adminAuth';

const MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Email or password is incorrect.',
  'auth/too-many-requests': 'Too many attempts. Wait a moment and try again.',
  'auth/network-request-failed': 'No connection. Check your internet.',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { status, notice } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const next = params.get('next')?.startsWith('/') ? params.get('next')! : '/';

  useEffect(() => {
    if (status === 'admin') navigate(next, { replace: true });
  }, [status, next, navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await adminSignIn(email, password);
    } catch (err) {
      setError(
        MESSAGES[(err as { code?: string }).code ?? ''] ?? 'Could not sign in. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="bg-mist flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <p className="font-display mb-8 text-center text-3xl font-bold uppercase">
          Areqa<span className="text-mint-strong">.</span>{' '}
          <span className="bg-mint rounded px-1.5 py-0.5 align-middle text-[10px] tracking-widest">
            Admin
          </span>
        </p>
        <form onSubmit={submit} className="card shadow-soft space-y-4 p-6">
          <h1 className="flex items-center gap-2 text-lg">
            <Lock className="size-4" /> Sign in
          </h1>
          {notice && (
            <p role="alert" className="bg-danger/10 text-danger-deep rounded p-3 text-sm">
              {notice}
            </p>
          )}
          <Field label="Email">
            {(a) => (
              <input
                {...a}
                className={`${a.className} h-11`}
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            )}
          </Field>
          <Field label="Password">
            {(a) => (
              <input
                {...a}
                className={`${a.className} h-11`}
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            )}
          </Field>
          {error && (
            <p role="alert" className="text-danger-deep text-sm">
              {error}
            </p>
          )}
          <Button type="submit" block disabled={busy || status === 'loading'}>
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
        <p className="text-muted mt-6 text-center text-xs">
          Access is limited to store staff. Admins are added by the owner.
        </p>
      </div>
    </main>
  );
}
