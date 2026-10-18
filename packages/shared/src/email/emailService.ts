import emailjs from '@emailjs/browser';
import type { EmailMessage } from './templates';

export interface EmailConfig {
  publicKey: string;
  serviceId: string;
  /** EmailJS template id. Both "customer" and "store" may point to the same generic template. */
  templateId: string;
}

export type EmailResult = { sent: true } | { sent: false; reason: string };

/**
 * Sends a pre-rendered email through EmailJS. The template only needs:
 *   To: {{to_email}}  ·  Subject: {{subject}}  ·  Reply-To: {{reply_to}}  ·  Content: {{{html}}}
 * Never throws — an email problem must never block an order.
 */
export async function sendEmail(
  config: EmailConfig,
  message: EmailMessage,
  timeoutMs = 12_000,
): Promise<EmailResult> {
  if (!config.publicKey || !config.serviceId || !config.templateId) {
    return { sent: false, reason: 'EmailJS not configured' };
  }
  try {
    const send = emailjs.send(
      config.serviceId,
      config.templateId,
      {
        to_email: message.toEmail,
        to_name: message.toName,
        subject: message.subject,
        html: message.html,
        reply_to: message.replyTo ?? '',
      },
      { publicKey: config.publicKey },
    );
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), timeoutMs),
    );
    await Promise.race([send, timeout]);
    return { sent: true };
  } catch (err) {
    const reason =
      err instanceof Error
        ? err.message
        : typeof err === 'object' && err && 'text' in err
          ? String((err as { text: unknown }).text)
          : String(err);
    console.warn('[email] not sent:', reason);
    return { sent: false, reason };
  }
}
