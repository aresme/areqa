import {
  ORDER_STATUS_DESCRIPTIONS,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  type OrderStatus,
  type PaymentMethod,
} from '../constants/orders';
import type { Order, OrderItem } from '../types';
import { formatKES } from '../utils/money';
import { formatKenyanPhone } from '../utils/phone';
import { badge, button, esc, layout, muted, p, section, table } from './html';

export interface EmailMessage {
  toEmail: string;
  toName: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export interface StoreInfo {
  storeName: string;
  storeUrl: string;
  contactEmail: string;
  phone: string;
  whatsappNumber: string;
  pickupLocation: string;
}

type OrderLike = Pick<
  Order,
  | 'orderNumber'
  | 'items'
  | 'subtotal'
  | 'discount'
  | 'deliveryFee'
  | 'total'
  | 'customer'
  | 'delivery'
  | 'paymentMethod'
>;

function itemsTable(items: OrderItem[]) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 8px;font-size:14px">${items
    .map(
      (i) => `<tr>
  <td width="64" style="padding:8px 12px 8px 0;vertical-align:top">${i.image ? `<img src="${esc(i.image)}${i.image.includes('unsplash') ? '?w=128&h=160&fit=crop' : ''}" width="56" height="70" alt="" style="display:block;border-radius:4px;object-fit:cover">` : ''}</td>
  <td style="padding:8px 0;vertical-align:top"><strong>${esc(i.name)}</strong><br><span style="color:#6B6F6B;font-size:13px">${esc(i.color)} · ${esc(i.size)} · Qty ${i.qty}</span></td>
  <td align="right" style="padding:8px 0;vertical-align:top;white-space:nowrap">${formatKES(i.unitPrice * i.qty)}</td></tr>`,
    )
    .join('')}</table>`;
}

function totals(o: OrderLike) {
  const rows: [string, string][] = [['Subtotal', formatKES(o.subtotal)]];
  if (o.discount)
    rows.push([`Discount (${esc(o.discount.code)})`, `−${formatKES(o.discount.amount)}`]);
  rows.push(['Delivery', o.deliveryFee === 0 ? 'Free' : formatKES(o.deliveryFee)]);
  rows.push(['Total', formatKES(o.total)]);
  return table(rows, { boldLast: true });
}

function deliveryBlock(o: OrderLike, store: StoreInfo) {
  const d = o.delivery;
  if (d.method === 'pickup') return p(`Store pickup: ${esc(store.pickupLocation)}`);
  return p(
    `${esc(o.customer.name)}<br>${esc(d.address)}<br>${esc(d.town)}, ${esc(d.county)}${d.notes ? `<br><em>${esc(d.notes)}</em>` : ''}<br><span style="color:#6B6F6B">${esc(d.zoneName)} · ${esc(d.estimatedDays)}</span>`,
  );
}

function paymentInstructions(method: PaymentMethod, total: number) {
  return method === 'pay_on_delivery'
    ? p(
        `<strong>${PAYMENT_METHOD_LABELS[method]}.</strong> Please have ${formatKES(total)} ready in cash or M-Pesa when your order arrives.`,
      )
    : p(
        `<strong>${PAYMENT_METHOD_LABELS[method]}.</strong> We will call you to confirm, then send our M-Pesa Till number. Your order is dispatched once payment is received.`,
      );
}

function storeFooter(store: StoreInfo) {
  return `Questions? Reply to this email, call ${esc(formatKenyanPhone(store.phone))} or WhatsApp us.<br>${esc(store.storeName)} · <a href="${esc(store.storeUrl)}" style="color:#1F7A3A">${esc(store.storeUrl.replace(/^https?:\/\//, ''))}</a>`;
}

export function orderConfirmationEmail(o: OrderLike, store: StoreInfo): EmailMessage {
  const body = [
    badge(`Order ${o.orderNumber}`),
    '<div style="height:16px"></div>',
    p(
      `Hi ${esc(o.customer.name.split(' ')[0] ?? o.customer.name)}, thank you for shopping with ${esc(store.storeName)}! We have received your order and will call you on <strong>${esc(formatKenyanPhone(o.customer.phone))}</strong> shortly to confirm.`,
    ),
    section('Your items', itemsTable(o.items)),
    totals(o),
    section(o.delivery.method === 'pickup' ? 'Pickup' : 'Delivery', deliveryBlock(o, store)),
    section('Payment', paymentInstructions(o.paymentMethod, o.total)),
    button('Track your order', `${store.storeUrl}/track`),
    muted(
      'To track your order you will need your order number and the phone number you used at checkout.',
    ),
  ].join('');
  return {
    toEmail: o.customer.email,
    toName: o.customer.name,
    subject: `Order ${o.orderNumber} received — ${store.storeName}`,
    html: layout({
      storeName: store.storeName,
      preheader: `We have received your order ${o.orderNumber}.`,
      heading: 'Order received',
      body,
      footer: storeFooter(store),
    }),
    replyTo: store.contactEmail,
  };
}

export function newOrderAlertEmail(
  o: OrderLike,
  store: StoreInfo,
  toEmail: string,
  adminUrl: string,
): EmailMessage {
  const c = o.customer;
  const body = [
    badge(formatKES(o.total)),
    '<div style="height:16px"></div>',
    p(
      `<strong>${esc(c.name)}</strong> placed order <strong>${esc(o.orderNumber)}</strong> (${o.items.reduce((n, i) => n + i.qty, 0)} items, ${PAYMENT_METHOD_LABELS[o.paymentMethod]}).`,
    ),
    p(
      `📞 <a href="tel:+${esc(c.phone)}">${esc(formatKenyanPhone(c.phone))}</a> · ✉️ ${esc(c.email)}`,
    ),
    section('Items', itemsTable(o.items)),
    totals(o),
    section(o.delivery.method === 'pickup' ? 'Pickup' : 'Deliver to', deliveryBlock(o, store)),
    button('Open in admin', `${adminUrl}/orders`),
  ].join('');
  return {
    toEmail,
    toName: store.storeName,
    subject: `🛍 New order ${o.orderNumber} — ${formatKES(o.total)} from ${c.name}`,
    html: layout({
      storeName: store.storeName,
      preheader: `New order from ${c.name}`,
      heading: 'New order',
      body,
      footer: 'Call the customer to confirm, then update the status in the admin panel.',
    }),
    replyTo: c.email,
  };
}

export function statusUpdateEmail(
  o: OrderLike,
  status: OrderStatus,
  store: StoreInfo,
  note?: string,
): EmailMessage {
  const body = [
    badge(ORDER_STATUS_LABELS[status]),
    '<div style="height:16px"></div>',
    p(
      `Hi ${esc(o.customer.name.split(' ')[0] ?? o.customer.name)}, your order <strong>${esc(o.orderNumber)}</strong> is now <strong>${ORDER_STATUS_LABELS[status].toLowerCase()}</strong>.`,
    ),
    p(ORDER_STATUS_DESCRIPTIONS[status]),
    note ? p(`<em>${esc(note)}</em>`) : '',
    status === 'out_for_delivery' && o.paymentMethod === 'pay_on_delivery'
      ? p(`Please have <strong>${formatKES(o.total)}</strong> ready for the rider.`)
      : '',
    status !== 'cancelled' ? button('Track your order', `${store.storeUrl}/track`) : '',
    section('Order summary', itemsTable(o.items)),
    totals(o),
  ].join('');
  return {
    toEmail: o.customer.email,
    toName: o.customer.name,
    subject: `Your order ${o.orderNumber} is ${ORDER_STATUS_LABELS[status].toLowerCase()} — ${store.storeName}`,
    html: layout({
      storeName: store.storeName,
      preheader: ORDER_STATUS_DESCRIPTIONS[status],
      heading: ORDER_STATUS_LABELS[status],
      body,
      footer: storeFooter(store),
    }),
    replyTo: store.contactEmail,
  };
}

export function contactMessageEmail(
  m: { name: string; email: string; phone: string; subject: string; message: string },
  store: StoreInfo,
  toEmail: string,
): EmailMessage {
  const body = [
    table([
      ['From', esc(m.name)],
      ['Email', esc(m.email)],
      ['Phone', esc(m.phone || '—')],
      ['Subject', esc(m.subject || '—')],
    ]),
    `<div style="background:#F5F7F5;border-radius:6px;padding:16px;font-size:15px;line-height:1.6;white-space:pre-wrap">${esc(m.message)}</div>`,
  ].join('');
  return {
    toEmail,
    toName: store.storeName,
    subject: `✉️ Contact form: ${m.subject || 'New message'} — ${m.name}`,
    html: layout({
      storeName: store.storeName,
      preheader: m.message.slice(0, 80),
      heading: 'New message',
      body,
      footer: 'Reply to this email to answer the customer directly.',
    }),
    replyTo: m.email,
  };
}
