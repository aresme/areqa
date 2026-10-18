import type { DateField } from './common';

export interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  county: string;
  town: string;
  address: string;
  notes: string;
  isDefault: boolean;
}

export interface CartLine {
  productId: string;
  variantKey: string;
  qty: number;
}

export interface UserProfile {
  displayName: string;
  email: string;
  phone: string;
  addresses: Address[];
  wishlist: string[];
  cart: CartLine[];
  createdAt: DateField;
  updatedAt: DateField;
}

export type AdminRole = 'owner' | 'staff';

export interface AdminUser {
  role: AdminRole;
  name: string;
  email: string;
}
