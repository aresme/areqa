import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { COL, normalizeKenyanPhone, type StoreSettings } from '@areqa/shared';
import { contactMessageEmail, sendEmail } from '@areqa/shared/email';
import { storeInfo } from '@/features/checkout/submitOrder';
import { config } from '@/lib/env';
import { requireFirebase } from '@/lib/firebase';
import { withTimeout } from '@/lib/withTimeout';

export interface ContactInput {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

/** Saved to Firestore (the admin inbox) first; the email to the store is best-effort. */
export async function sendContactMessage(input: ContactInput, settings: StoreSettings) {
  const msg = {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone ? normalizeKenyanPhone(input.phone) || input.phone.trim() : '',
    subject: input.subject.trim(),
    message: input.message.trim(),
  };
  await withTimeout(
    addDoc(collection(requireFirebase().db, COL.messages), {
      ...msg,
      status: 'new',
      createdAt: serverTimestamp(),
    }),
  );
  const to = settings.contactEmail || settings.orderAlertEmail;
  if (to) {
    const { publicKey, serviceId, templateStore, templateCustomer } = config.emailjs;
    void sendEmail(
      { publicKey, serviceId, templateId: templateStore || templateCustomer },
      contactMessageEmail(msg, storeInfo(settings), to),
    );
  }
}
