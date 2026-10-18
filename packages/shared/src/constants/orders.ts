export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'packed',
  'out_for_delivery',
  'delivered',
  'cancelled',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Happy-path timeline shown to customers (cancelled is handled separately). */
export const ORDER_TIMELINE: OrderStatus[] = [
  'pending',
  'confirmed',
  'packed',
  'out_for_delivery',
  'delivered',
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  packed: 'Packed',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  pending: 'We have received your order and will call you shortly to confirm.',
  confirmed: 'Your order is confirmed and being prepared.',
  packed: 'Your items are packed and waiting for the rider.',
  out_for_delivery: 'Your order is on its way to you.',
  delivered: 'Your order has been delivered. Enjoy!',
  cancelled: 'This order has been cancelled.',
};

/** Statuses an admin can move to from a given status. */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['packed', 'cancelled'],
  packed: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

export const PAYMENT_METHODS = ['pay_on_delivery', 'mpesa_after_confirmation'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pay_on_delivery: 'Pay on Delivery',
  mpesa_after_confirmation: 'Pay via M-Pesa after confirmation',
};

export const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const DELIVERY_METHODS = ['delivery', 'pickup'] as const;
export type DeliveryMethod = (typeof DELIVERY_METHODS)[number];

/** Rules allow at most this many distinct lines per order (get()/exists() budget). */
export const MAX_ORDER_LINES = 10;
export const MAX_QTY_PER_LINE = 10;
