import { Link } from 'react-router-dom';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { formatKenyanPhone, telLink, whatsappLink } from '@areqa/shared';
import { useSettings } from '@/features/content/hooks';
import { NewsletterForm } from '@/components/NewsletterForm';
import { FOOTER_COMPANY, FOOTER_HELP, FOOTER_SHOP } from './nav';
import { SocialIcons } from './SocialIcons';

function LinkColumn({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <h2 className="label text-paper/60 mb-4 font-sans">{title}</h2>
      <ul className="space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="text-paper/90 hover:text-mint transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const { settings } = useSettings();
  return (
    <footer className="bg-ink text-paper">
      <div className="container-page grid gap-12 py-16 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="font-display text-4xl font-bold uppercase tracking-[-0.04em]">
            {settings.storeName}
            <span className="text-mint">.</span>
          </p>
          <p className="text-paper/70 mt-3 max-w-xs text-sm">{settings.tagline}</p>
          <div className="mt-8 max-w-sm">
            <p className="mb-1 text-sm font-semibold">Get 10% off your first order</p>
            <p className="text-paper/60 mb-3 text-xs">
              New drops and members-only offers. Unsubscribe anytime.
            </p>
            <NewsletterForm source="footer" tone="dark" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-5">
          <LinkColumn title="Shop" links={FOOTER_SHOP} />
          <LinkColumn title="Help" links={FOOTER_HELP} />
          <LinkColumn title="Areqa" links={FOOTER_COMPANY} />
        </div>

        <div className="lg:col-span-3">
          <h2 className="label text-paper/60 mb-4 font-sans">Contact</h2>
          <ul className="text-paper/90 space-y-3 text-sm">
            {settings.phone && (
              <li>
                <a
                  href={telLink(settings.phone)}
                  className="hover:text-mint flex items-start gap-3"
                >
                  <Phone className="mt-0.5 size-4 shrink-0" aria-hidden />{' '}
                  {formatKenyanPhone(settings.phone)}
                </a>
              </li>
            )}
            {settings.whatsappNumber && (
              <li>
                <a
                  href={whatsappLink(settings.whatsappNumber)}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-mint flex items-start gap-3"
                >
                  <MessageCircle className="mt-0.5 size-4 shrink-0" aria-hidden /> WhatsApp us
                </a>
              </li>
            )}
            {settings.contactEmail && (
              <li>
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="hover:text-mint flex items-start gap-3 break-all"
                >
                  <Mail className="mt-0.5 size-4 shrink-0" aria-hidden /> {settings.contactEmail}
                </a>
              </li>
            )}
            {settings.address && (
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden /> {settings.address}
              </li>
            )}
          </ul>
          {settings.businessHours && (
            <p className="text-paper/60 mt-4 text-xs">{settings.businessHours}</p>
          )}
          <div className="mt-6">
            <SocialIcons social={settings.social} />
          </div>
        </div>
      </div>
      <div className="border-paper/10 border-t">
        <div className="container-page text-paper/60 flex flex-col gap-2 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.storeName}. All rights reserved.
          </p>
          <p>Prices in Kenya Shillings · Pay on delivery · M-Pesa accepted</p>
        </div>
      </div>
    </footer>
  );
}
