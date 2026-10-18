import { toDate, type Order, type WithId } from '@areqa/shared';

const DAY = 86_400_000;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** When an order was delivered (status history), falling back to when it was placed. */
export function deliveredAt(o: Order): Date | null {
  if (o.status !== 'delivered') return null;
  const ev = [...o.statusHistory].reverse().find((h) => h.status === 'delivered');
  return toDate(ev?.at ?? o.createdAt);
}

export function summarize(orders: WithId<Order>[], now = new Date()) {
  const today = startOfDay(now).getTime();
  const weekStart = today - ((now.getDay() + 6) % 7) * DAY; // Monday
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const live = orders.filter((o) => o.status !== 'cancelled');

  const sumDelivered = (from: number) =>
    orders.reduce((n, o) => {
      const at = deliveredAt(o)?.getTime();
      return at && at >= from ? n + o.total : n;
    }, 0);

  // 30 daily buckets, oldest first.
  const days = Array.from({ length: 30 }, (_, i) => {
    const start = today - (29 - i) * DAY;
    const dayOrders = live.filter((o) => {
      const t = toDate(o.createdAt)?.getTime() ?? 0;
      return t >= start && t < start + DAY;
    });
    return {
      date: new Date(start),
      value: dayOrders.reduce((n, o) => n + o.total, 0),
      orders: dayOrders.length,
    };
  });

  const sold = new Map<string, { name: string; qty: number; revenue: number; image: string }>();
  for (const o of live.filter((x) => (toDate(x.createdAt)?.getTime() ?? 0) >= today - 29 * DAY)) {
    for (const it of o.items) {
      const prev = sold.get(it.productId) ?? { name: it.name, qty: 0, revenue: 0, image: it.image };
      sold.set(it.productId, {
        ...prev,
        qty: prev.qty + it.qty,
        revenue: prev.revenue + it.qty * it.unitPrice,
      });
    }
  }

  return {
    todayCount: orders.filter((o) => (toDate(o.createdAt)?.getTime() ?? 0) >= today).length,
    revenueWeek: sumDelivered(weekStart),
    revenueMonth: sumDelivered(monthStart),
    days,
    topSellers: [...sold.entries()]
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5),
  };
}
