import { describe, expect, it } from 'vitest';
import type { Order, WithId } from '@areqa/shared';
import { summarize } from './summary';

const at = (d: Date) => ({ seconds: d.getTime() / 1000, nanoseconds: 0, toDate: () => d });
const order = (over: Partial<Order> & { created: Date }): WithId<Order> =>
  ({
    id: Math.random().toString(),
    total: 1000,
    status: 'pending',
    statusHistory: [],
    items: [],
    createdAt: at(over.created),
    ...over,
  }) as unknown as WithId<Order>;

describe('dashboard summary', () => {
  const now = new Date(2026, 9, 18, 15); // Sunday 18 Oct 2026
  it('counts today, and revenue only from delivered orders by delivery date', () => {
    const s = summarize(
      [
        order({ created: new Date(2026, 9, 18, 9) }),
        order({
          created: new Date(2026, 9, 10),
          status: 'delivered',
          total: 5000,
          statusHistory: [{ status: 'delivered', at: at(new Date(2026, 9, 14)), by: 'a' }],
        }),
        order({
          created: new Date(2026, 8, 25),
          status: 'delivered',
          total: 700,
          statusHistory: [{ status: 'delivered', at: at(new Date(2026, 9, 2)), by: 'a' }],
        }),
        order({ created: new Date(2026, 9, 17), status: 'cancelled', total: 9999 }),
      ],
      now,
    );
    expect(s.todayCount).toBe(1);
    expect(s.revenueWeek).toBe(5000); // week starts Mon 12 Oct
    expect(s.revenueMonth).toBe(5700);
    expect(s.days).toHaveLength(30);
    expect(s.days.at(-1)).toMatchObject({ orders: 1, value: 1000 });
    expect(s.days.at(-2)?.orders).toBe(0); // cancelled excluded
  });
});
