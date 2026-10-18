import type { KES } from '../types/common';

const formatter = new Intl.NumberFormat('en-KE', { maximumFractionDigits: 0 });

/** 4500 → "KSh 4,500". Input must be whole shillings. */
export function formatKES(amount: KES): string {
  return `KSh ${formatter.format(Math.round(amount))}`;
}

/** Guard against floats sneaking into price fields. */
export function toKES(value: number | string): KES {
  const n = typeof value === 'string' ? Number(value.replace(/[^\d.-]/g, '')) : value;
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
}

export function discountPercent(price: KES, compareAt: KES | null | undefined): number {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}
