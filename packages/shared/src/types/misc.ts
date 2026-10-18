import type { DateField, KES } from './common';

export type ReviewStatus = 'pending' | 'approved' | 'hidden';

export interface Review {
  productId: string;
  orderId: string;
  userId: string;
  userName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  body: string;
  status: ReviewStatus;
  createdAt: DateField;
}

export type DiscountType = 'percentage' | 'fixed';

/** Doc id is the uppercase code. */
export interface Discount {
  code: string;
  type: DiscountType;
  /** Percent (1–100) or KES amount. */
  value: number;
  minOrder: KES;
  startsAt: DateField;
  endsAt: DateField;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  /** Set when checkout increments usedCount (rules tie it to the new order). */
  lastOrderId: string | null;
}

export type MessageStatus = 'new' | 'read' | 'replied';

export interface ContactMessage {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: MessageStatus;
  createdAt: DateField;
}

export interface NewsletterSignup {
  email: string;
  source: string;
  createdAt: DateField;
}

export interface DeliveryZone {
  name: string;
  counties: string[];
  /** Optional town list; empty means the whole county. */
  towns: string[];
  fee: KES;
  estimatedDays: string;
  sortOrder: number;
  isActive: boolean;
}
