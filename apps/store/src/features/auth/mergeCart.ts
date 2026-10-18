import { MAX_ORDER_LINES, MAX_QTY_PER_LINE, type CartLine } from '@areqa/shared';

/** Union of two carts; for the same variant keep the larger quantity (never double-count). */
export function mergeCarts(local: CartLine[], remote: CartLine[]): CartLine[] {
  const map = new Map<string, CartLine>();
  for (const line of [...remote, ...local]) {
    const key = `${line.productId}::${line.variantKey}`;
    const prev = map.get(key);
    map.set(
      key,
      prev ? { ...line, qty: Math.min(MAX_QTY_PER_LINE, Math.max(prev.qty, line.qty)) } : line,
    );
  }
  return [...map.values()].slice(0, MAX_ORDER_LINES);
}

export function mergeWishlists(local: string[], remote: string[]): string[] {
  return [...new Set([...local, ...remote])].slice(0, 200);
}
