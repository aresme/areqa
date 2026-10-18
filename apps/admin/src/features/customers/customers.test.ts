import { describe, expect, it } from 'vitest';
import type { Order, UserProfile, WithId } from '@areqa/shared';
import { buildCustomers } from './customers';

const ts = (d: string) => ({ seconds: 0, nanoseconds: 0, toDate: () => new Date(d) });
const order = (id: string, phone: string, total: number, over: Partial<Order> = {}) =>
  ({
    id,
    userId: null,
    status: 'delivered',
    total,
    createdAt: ts('2026-10-01'),
    customer: { name: 'Guest', email: 'g@x.com', phone },
    ...over,
  }) as unknown as WithId<Order>;

describe('buildCustomers', () => {
  it('groups guest orders by phone and joins them to a registered user with that phone', () => {
    const users = [
      {
        id: 'u1',
        displayName: 'Amina',
        email: 'a@x.com',
        phone: '254711000000',
        createdAt: ts('2026-09-01'),
      } as unknown as WithId<UserProfile>,
    ];
    const list = buildCustomers(
      [
        order('o1', '254711000000', 1000),
        order('o2', '254722000000', 2000),
        order('o3', '254722000000', 500, { status: 'cancelled' }),
        order('o4', '254733000000', 300, { userId: 'u1' }),
      ],
      users,
    );
    const amina = list.find((c) => c.key === 'u1')!;
    expect(amina).toMatchObject({ registered: true, orderCount: 2, totalSpent: 1300 });
    const guest = list.find((c) => c.key === 'phone:254722000000')!;
    expect(guest).toMatchObject({ orderCount: 2, totalSpent: 2000 });
  });
});
