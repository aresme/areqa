import {
  newOrderAlertEmail,
  orderConfirmationEmail,
  sendEmail,
  type StoreInfo,
} from '@areqa/shared/email';
import { placeOrder, type CheckoutInput, type PlacedOrder } from '@areqa/shared/services';
import type { StoreSettings } from '@areqa/shared';
import { config } from '@/lib/env';
import { requireFirebase } from '@/lib/firebase';
import { saveLastOrder } from './lastOrder';

export function storeInfo(settings: StoreSettings): StoreInfo {
  return {
    storeName: settings.storeName,
    storeUrl: config.siteUrl,
    contactEmail: settings.contactEmail,
    phone: settings.phone,
    whatsappNumber: settings.whatsappNumber,
    pickupLocation: settings.pickupLocation,
  };
}

/** Sends both order emails in the background. Failures are logged and never surface to the customer. */
function sendOrderEmails(order: PlacedOrder, settings: StoreSettings) {
  const store = storeInfo(settings);
  const { publicKey, serviceId, templateCustomer, templateStore } = config.emailjs;
  const jobs = [
    sendEmail(
      { publicKey, serviceId, templateId: templateCustomer },
      orderConfirmationEmail(order, store),
    ),
  ];
  const alertTo = settings.orderAlertEmail || settings.contactEmail;
  if (alertTo) {
    jobs.push(
      sendEmail(
        { publicKey, serviceId, templateId: templateStore || templateCustomer },
        newOrderAlertEmail(order, store, alertTo, config.adminUrl),
      ),
    );
  }
  void Promise.allSettled(jobs);
}

export async function submitOrder(
  input: CheckoutInput,
  settings: StoreSettings,
): Promise<PlacedOrder> {
  const order = await placeOrder(requireFirebase().db, input);
  saveLastOrder(order);
  sendOrderEmails(order, settings);
  return order;
}
