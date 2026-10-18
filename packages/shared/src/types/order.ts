import type { DateField, KES } from './common';
import type {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  DeliveryMethod,
} from '../constants/orders';

export interface OrderItem {
  productId: string;
  variantKey: string;
  name: string;
  slug: string;
  image: string;
  color: string;
  size: string;
  qty: number;
  unitPrice: KES;
}

export interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
}

export interface OrderDelivery {
  method: DeliveryMethod;
  county: string;
  town: string;
  address: string;
  notes: string;
  zoneId: string | null;
  zoneName: string;
  fee: KES;
  estimatedDays: string;
}

export interface StatusEvent {
  status: OrderStatus;
  at: DateField;
  /** uid of admin, or "customer" / "system". */
  by: string;
  note?: string;
}

export interface OrderDiscount {
  code: string;
  amount: KES;
}

export interface Order {
  orderNumber: string;
  userId: string | null;
  customer: OrderCustomer;
  delivery: OrderDelivery;
  items: OrderItem[];
  /** Product ids in this order — lets rules verify review eligibility without iterating items. */
  productIds: string[];
  itemCount: number;
  subtotal: KES;
  discount: OrderDiscount | null;
  deliveryFee: KES;
  total: KES;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentRef: string | null;
  paidAt: DateField;
  status: OrderStatus;
  statusHistory: StatusEvent[];
  adminNotes: string;
  /** Doc id of the matching orderLookup entry. */
  lookupId: string;
  createdAt: DateField;
  updatedAt: DateField;
}

/** Public, PII-free tracking doc at `orderLookup/{orderNumber}__{sha256(phone)}`. */
export interface OrderLookup {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  statusHistory: Pick<StatusEvent, 'status' | 'at'>[];
  itemCount: number;
  total: KES;
  deliveryMethod: DeliveryMethod;
  createdAt: DateField;
}
