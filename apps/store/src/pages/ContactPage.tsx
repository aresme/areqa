import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CircleCheck, Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { formatKenyanPhone, isValidKenyanPhone, telLink, whatsappLink } from '@areqa/shared';
import { Field, Input, Select, Textarea } from '@/components/form/Field';
import { Seo } from '@/components/Seo';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/authStore';
import { sendContactMessage } from '@/features/content/contact';
import { useSettings } from '@/features/content/hooks';
import { rateLimit } from '@/lib/rateLimit';

const SUBJECTS = [
  'Order question',
  'Sizing & fit',
  'Returns & exchanges',
  'Wholesale & collaborations',
  'Something else',
];

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(80),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .refine((v) => v === '' || isValidKenyanPhone(v), 'Use a Kenyan number like 0712 345 678'),
  subject: z.string().min(1),
  message: z.string().trim().min(10, 'Tell us a little more (at least 10 characters)').max(3000),
  company: z.string().max(0).optional(),
});
type Form = z.infer<typeof schema>;

export default function ContactPage() {
  const { settings } = useSettings();
  const { user, profile } = useAuth();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState, reset } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: profile?.displayName ?? '',
      email: user?.email ?? '',
      phone: profile?.phone ? formatKenyanPhone(profile.phone) : '',
      subject: SUBJECTS[0],
      message: '',
      company: '',
    },
  });
  const e = formState.errors;

  const onSubmit = async (v: Form) => {
    setError('');
    if (v.company) return setSent(true); // honeypot
    if (!rateLimit('contact', { max: 3, windowMs: 15 * 60_000 }))
      return setError(
        'You have sent several messages already. Please wait a few minutes or WhatsApp us.',
      );
    try {
      await sendContactMessage(v, settings);
      setSent(true);
      reset();
    } catch {
      setError('Your message could not be sent. Check your connection, or reach us on WhatsApp.');
    }
  };

  const channels = [
    settings.whatsappNumber && {
      icon: MessageCircle,
      label: 'WhatsApp',
      value: 'Chat with us',
      href: whatsappLink(settings.whatsappNumber, 'Hi!'),
      external: true,
    },
    settings.phone && {
      icon: Phone,
      label: 'Call',
      value: formatKenyanPhone(settings.phone),
      href: telLink(settings.phone),
    },
    settings.contactEmail && {
      icon: Mail,
      label: 'Email',
      value: settings.contactEmail,
      href: `mailto:${settings.contactEmail}`,
    },
  ].filter(Boolean) as {
    icon: typeof Mail;
    label: string;
    value: string;
    href: string;
    external?: boolean;
  }[];

  return (
    <div className="container-page pb-24 pt-10 sm:pt-16">
      <Seo
        title="Contact us"
        description="Get in touch with Areqa by WhatsApp, phone, email or our contact form. Studio in Nakuru CBD."
        path="/contact"
      />
      <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <p className="label text-mint-deep">Contact</p>
          <h1 className="text-display mt-2 uppercase">We'd love to hear from you</h1>
          <p className="text-muted mt-4">
            Questions about an order, sizing or a collaboration? WhatsApp is fastest.
          </p>
          <ul className="mt-8 space-y-3">
            {channels.map(({ icon: Icon, label, value, href, external }) => (
              <li key={label}>
                <a
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel="noreferrer"
                  className="border-line hover:border-ink flex items-center gap-4 rounded-lg border p-4 transition-colors"
                >
                  <span className="bg-mint flex size-10 items-center justify-center rounded-full">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span>
                    <span className="text-muted block text-xs uppercase tracking-wider">
                      {label}
                    </span>
                    <span className="font-medium">{value}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <dl className="mt-8 space-y-3 text-sm">
            {settings.address && (
              <div className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                <dd>{settings.address}</dd>
              </div>
            )}
            {settings.businessHours && (
              <div className="flex gap-3">
                <Clock className="mt-0.5 size-4 shrink-0" aria-hidden />
                <dd>{settings.businessHours}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="bg-mist rounded-lg p-6 sm:p-8">
          {sent ? (
            <div
              className="flex min-h-80 flex-col items-center justify-center text-center"
              role="status"
            >
              <span className="bg-mint flex size-14 items-center justify-center rounded-full">
                <CircleCheck className="size-7" aria-hidden />
              </span>
              <h2 className="font-display mt-5 text-2xl font-bold uppercase">Message sent</h2>
              <p className="text-muted mt-2 max-w-sm text-sm">
                Thanks for reaching out. We will reply by email
                {settings.businessHours ? ' during business hours' : ''}.
              </p>
              <Button variant="secondary" className="mt-6" onClick={() => setSent(false)}>
                Send another
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="grid gap-4 sm:grid-cols-2"
            >
              <Field label="Name" error={e.name?.message}>
                {(a) => <Input {...a} {...register('name')} autoComplete="name" />}
              </Field>
              <Field label="Email" error={e.email?.message}>
                {(a) => <Input {...a} {...register('email')} type="email" autoComplete="email" />}
              </Field>
              <Field label="Phone" optional error={e.phone?.message}>
                {(a) => <Input {...a} {...register('phone')} type="tel" autoComplete="tel" />}
              </Field>
              <Field label="Topic">
                {(a) => (
                  <Select {...a} {...register('subject')}>
                    {SUBJECTS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Message" error={e.message?.message} className="sm:col-span-2">
                {(a) => (
                  <Textarea
                    {...a}
                    {...register('message')}
                    rows={6}
                    placeholder="Include your order number if it's about an order."
                  />
                )}
              </Field>
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                className="hidden"
                {...register('company')}
              />
              {error && (
                <p role="alert" className="text-danger-deep text-sm sm:col-span-2">
                  {error}
                </p>
              )}
              <div className="sm:col-span-2">
                <Button type="submit" size="lg" block disabled={formState.isSubmitting}>
                  {formState.isSubmitting ? 'Sending…' : 'Send message'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
