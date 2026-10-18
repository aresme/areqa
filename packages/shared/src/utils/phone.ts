/** Accepts 07XXXXXXXX, 01XXXXXXXX, +2547/+2541…, 2547…; spaces and dashes allowed. */
const KE_PHONE = /^(?:\+?254|0)([17]\d{8})$/;

export function isValidKenyanPhone(input: string): boolean {
  return KE_PHONE.test(input.replace(/[\s-]/g, ''));
}

/** Normalise to E.164 without plus: "0712 345 678" → "254712345678". Returns "" if invalid. */
export function normalizeKenyanPhone(input: string): string {
  const match = input.replace(/[\s-]/g, '').match(KE_PHONE);
  return match ? `254${match[1]}` : '';
}

/** "254712345678" → "+254 712 345 678" */
export function formatKenyanPhone(input: string): string {
  const n = normalizeKenyanPhone(input);
  if (!n) return input;
  return `+254 ${n.slice(3, 6)} ${n.slice(6, 9)} ${n.slice(9)}`;
}

export function whatsappLink(number: string, message?: string): string {
  const n = normalizeKenyanPhone(number) || number.replace(/\D/g, '');
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${n}${text}`;
}

export function telLink(number: string): string {
  const n = normalizeKenyanPhone(number);
  return n ? `tel:+${n}` : `tel:${number}`;
}
