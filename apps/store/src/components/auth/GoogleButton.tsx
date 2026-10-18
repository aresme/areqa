import { useState } from 'react';
import { authErrorMessage } from '@/features/auth/errors';
import { signInGoogle } from '@/features/auth/authService';

export function GoogleButton({
  onError,
  onSuccess,
}: {
  onError: (msg: string) => void;
  onSuccess: () => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await signInGoogle();
          onSuccess();
        } catch (err) {
          const msg = authErrorMessage(err);
          if (msg) onError(msg);
        } finally {
          setBusy(false);
        }
      }}
      className="border-line hover:border-ink flex h-12 w-full items-center justify-center gap-3 rounded border text-sm font-semibold transition-colors disabled:opacity-50"
    >
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
        <path
          fill="#4285F4"
          d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.3-4.8 3.3-8z"
        />
        <path
          fill="#34A853"
          d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23z"
        />
        <path fill="#FBBC05" d="M5.8 14.2a6.6 6.6 0 0 1 0-4.3V7.1H2.1a11 11 0 0 0 0 9.9l3.7-2.8z" />
        <path
          fill="#EA4335"
          d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4z"
        />
      </svg>
      {busy ? 'Connecting…' : 'Continue with Google'}
    </button>
  );
}

export function OrDivider() {
  return (
    <div className="text-muted my-6 flex items-center gap-4 text-xs uppercase tracking-widest">
      <span className="bg-line h-px flex-1" /> or <span className="bg-line h-px flex-1" />
    </div>
  );
}
