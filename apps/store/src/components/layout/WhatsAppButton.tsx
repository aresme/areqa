import { useLocation } from 'react-router-dom';
import { whatsappLink } from '@areqa/shared';
import { useSettings } from '@/features/content/hooks';

export function WhatsAppButton() {
  const { settings } = useSettings();
  const { pathname } = useLocation();
  // Keep the checkout form unobstructed.
  if (!settings.whatsappNumber || pathname === '/checkout') return null;
  return (
    <a
      href={whatsappLink(settings.whatsappNumber, `Hi ${settings.storeName}, I have a question.`)}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="text-ink shadow-soft fixed bottom-4 left-4 z-30 flex size-12 items-center justify-center rounded-full bg-[#25D366] transition-transform hover:scale-105 sm:bottom-6 sm:left-6 sm:size-14"
    >
      <svg viewBox="0 0 24 24" className="size-6 fill-current sm:size-7" aria-hidden>
        <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8zm8.4-18.2A11.8 11.8 0 0 0 1.7 17.9L0 24l6.3-1.7A11.8 11.8 0 0 0 24 12c0-3.2-1.2-6.2-3.6-8.4z" />
      </svg>
    </a>
  );
}
