import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { isValidKenyanPhone } from '@areqa/shared';
import { AuthShell } from '@/components/auth/AuthShell';
import { GoogleButton, OrDivider } from '@/components/auth/GoogleButton';
import { Field, Input } from '@/components/form/Field';
import { Seo } from '@/components/Seo';
import { Button } from '@/components/ui/Button';
import { registerEmail } from '@/features/auth/authService';
import { useAuth } from '@/features/auth/authStore';
import { authErrorMessage } from '@/features/auth/errors';
import { useNext } from '@/features/auth/useNext';

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your full name').max(80),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .refine((v) => v === '' || isValidKenyanPhone(v), 'Use a Kenyan number like 0712 345 678'),
  password: z.string().min(8, 'Use at least 8 characters'),
});
type Form = z.infer<typeof schema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const next = useNext();
  const status = useAuth((s) => s.status);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { phone: '' },
  });

  useEffect(() => {
    if (status === 'user') navigate(next, { replace: true });
  }, [status, next, navigate]);

  const onSubmit = async (v: Form) => {
    setError('');
    try {
      await registerEmail(v.name, v.email, v.password, v.phone);
    } catch (err) {
      setError(authErrorMessage(err));
    }
  };

  return (
    <AuthShell eyebrow="Join Areqa" title="Create account">
      <Seo title="Create account" noIndex />
      <GoogleButton onError={setError} onSuccess={() => undefined} />
      <OrDivider />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Field label="Full name" error={formState.errors.name?.message}>
          {(a) => <Input {...a} {...register('name')} autoComplete="name" />}
        </Field>
        <Field label="Email" error={formState.errors.email?.message}>
          {(a) => (
            <Input
              {...a}
              {...register('email')}
              type="email"
              autoComplete="email"
              inputMode="email"
            />
          )}
        </Field>
        <Field
          label="Phone"
          optional
          error={formState.errors.phone?.message}
          hint="Pre-fills checkout."
        >
          {(a) => (
            <Input
              {...a}
              {...register('phone')}
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="0712 345 678"
            />
          )}
        </Field>
        <Field
          label="Password"
          error={formState.errors.password?.message}
          hint="At least 8 characters."
        >
          {(a) => (
            <Input {...a} {...register('password')} type="password" autoComplete="new-password" />
          )}
        </Field>
        {error && (
          <p role="alert" className="text-danger-deep text-sm">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" block disabled={formState.isSubmitting}>
          {formState.isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
        <p className="text-muted text-center text-xs">
          By creating an account you agree to our{' '}
          <Link to="/terms" className="underline">
            terms
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="underline">
            privacy policy
          </Link>
          .
        </p>
      </form>
      <p className="text-muted mt-8 text-center text-sm">
        Already have an account?{' '}
        <Link to="/login" className="text-ink font-semibold underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
