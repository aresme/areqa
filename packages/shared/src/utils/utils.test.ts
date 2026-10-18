import { describe, expect, it } from 'vitest';
import type { DeliveryZone, Discount, WithId } from '../types';
import { deliveryFeeFor, resolveZone } from './delivery';
import { evaluateDiscount, normalizeCode } from './discount';
import { formatKES } from './money';
import { isOrderNumber } from './order';
import { formatKenyanPhone, isValidKenyanPhone, normalizeKenyanPhone } from './phone';
import { variantKey } from './text';

const day = 86_400_000;
const disc = (over: Partial<Discount> = {}): Discount => ({
  code: 'X',
  type: 'percentage',
  value: 10,
  minOrder: 0,
  usageLimit: null,
  usedCount: 0,
  isActive: true,
  lastOrderId: null,
  startsAt: new Date(Date.now() - day),
  endsAt: new Date(Date.now() + day),
  ...over,
});

describe('phone', () => {
  it.each(['0712345678', '0712 345 678', '+254712345678', '254112345678', '0112-345-678'])(
    'accepts %s',
    (p) => {
      expect(isValidKenyanPhone(p)).toBe(true);
    },
  );
  it.each(['712345678', '0812345678', '+255712345678', '07123456', 'abc'])('rejects %s', (p) => {
    expect(isValidKenyanPhone(p)).toBe(false);
  });
  it('normalises and formats', () => {
    expect(normalizeKenyanPhone('0712 345 678')).toBe('254712345678');
    expect(formatKenyanPhone('0712345678')).toBe('+254 712 345 678');
  });
});

describe('discount (must mirror firestore.rules)', () => {
  it('floors percentage discounts', () =>
    expect(evaluateDiscount(disc(), 14985)).toEqual({ ok: true, amount: 1498 }));
  it('caps fixed discounts at the subtotal', () =>
    expect(evaluateDiscount(disc({ type: 'fixed', value: 500 }), 300)).toEqual({
      ok: true,
      amount: 300,
    }));
  it('enforces minimum order', () =>
    expect(evaluateDiscount(disc({ minOrder: 2000 }), 1999).ok).toBe(false));
  it('enforces usage limit and dates', () => {
    expect(evaluateDiscount(disc({ usageLimit: 5, usedCount: 5 }), 5000).ok).toBe(false);
    expect(evaluateDiscount(disc({ endsAt: new Date(Date.now() - 1) }), 5000).ok).toBe(false);
    expect(evaluateDiscount(disc({ startsAt: new Date(Date.now() + day) }), 5000).ok).toBe(false);
    expect(evaluateDiscount(disc({ isActive: false }), 5000).ok).toBe(false);
  });
  it('normalises codes', () => expect(normalizeCode(' karibu 10 ')).toBe('KARIBU10'));
});

describe('delivery zones', () => {
  const z = (
    id: string,
    counties: string[],
    towns: string[],
    fee: number,
  ): WithId<DeliveryZone> => ({
    id,
    name: id,
    counties,
    towns,
    fee,
    estimatedDays: '',
    sortOrder: 0,
    isActive: true,
  });
  const zones = [
    z('nakuru-county', ['Nakuru'], [], 300),
    z('nakuru-town', ['Nakuru'], ['Milimani', 'Lanet'], 150),
    z('metro', ['Nairobi'], [], 350),
  ];
  it('prefers a town match over a county-wide zone', () =>
    expect(resolveZone(zones, 'Nakuru', ' milimani ')?.id).toBe('nakuru-town'));
  it('falls back to the county zone', () =>
    expect(resolveZone(zones, 'Nakuru', 'Njoro')?.id).toBe('nakuru-county'));
  it('returns null for uncovered counties', () =>
    expect(resolveZone(zones, 'Turkana', '')).toBeNull());
  it('applies the free threshold to the discounted subtotal', () => {
    expect(deliveryFeeFor(350, 5000, 5000)).toBe(0);
    expect(deliveryFeeFor(350, 4999, 5000)).toBe(350);
    expect(deliveryFeeFor(350, 99999, 0)).toBe(350);
  });
});

describe('misc', () => {
  it('formats KES', () => expect(formatKES(12500)).toBe('KSh 12,500'));
  it('builds stable variant keys', () =>
    expect(variantKey('Off White', 'XL')).toBe('off-white_xl'));
  it('validates order numbers', () => {
    expect(isOrderNumber('ord-20261018-4821')).toBe(true);
    expect(isOrderNumber('ORD-2026-4821')).toBe(false);
  });
});
