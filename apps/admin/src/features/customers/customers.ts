import { toDate, type Order, type UserProfile, type WithId } from '@areqa/shared';

export interface Customer {
  /** userId for registered customers, otherwise "phone:2547…". */
  key: string;
  name: string;
  email: string;
  phone: string;
  registered: boolean;
  orders: WithId<Order>[];
  orderCount: number;
  totalSpent: number;
  lastOrderAt: Date | null;
  joinedAt: Date | null;
}

/**
 * Merges registered users and order history into one customer list. Guest orders are
 * grouped by phone; a guest order whose phone matches a registered user joins that user.
 */
export function buildCustomers(orders: WithId<Order>[], users: WithId<UserProfile>[]): Customer[] {
  const map = new Map<string, Customer>();
  const phoneToKey = new Map<string, string>();

  for (const u of users) {
    map.set(u.id, {
      key: u.id,
      name: u.displayName,
      email: u.email,
      phone: u.phone,
      registered: true,
      orders: [],
      orderCount: 0,
      totalSpent: 0,
      lastOrderAt: null,
      joinedAt: toDate(u.createdAt),
    });
    if (u.phone) phoneToKey.set(u.phone, u.id);
  }

  for (const o of orders) {
    const key =
      (o.userId && map.has(o.userId) ? o.userId : null) ??
      phoneToKey.get(o.customer.phone) ??
      `phone:${o.customer.phone}`;
    let c = map.get(key);
    if (!c) {
      c = {
        key,
        name: o.customer.name,
        email: o.customer.email,
        phone: o.customer.phone,
        registered: false,
        orders: [],
        orderCount: 0,
        totalSpent: 0,
        lastOrderAt: null,
        joinedAt: null,
      };
      map.set(key, c);
    }
    c.orders.push(o);
    c.orderCount++;
    if (o.status !== 'cancelled') c.totalSpent += o.total;
    const at = toDate(o.createdAt);
    if (at && (!c.lastOrderAt || at > c.lastOrderAt)) {
      c.lastOrderAt = at;
      // Most recent order wins for contact details a guest may have updated.
      if (!c.registered) {
        c.name = o.customer.name;
        c.email = o.customer.email;
      }
    }
    if (!c.phone) c.phone = o.customer.phone;
  }

  return [...map.values()].sort(
    (a, b) =>
      (b.lastOrderAt?.getTime() ?? 0) - (a.lastOrderAt?.getTime() ?? 0) ||
      b.totalSpent - a.totalSpent,
  );
}
