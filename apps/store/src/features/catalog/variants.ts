import { variantKey } from '@areqa/shared';

export type StockMap = Record<string, number>;

export function stockOf(stock: StockMap | undefined, color: string, size: string): number {
  return stock?.[variantKey(color, size)] ?? 0;
}

export function colorHasStock(
  stock: StockMap | undefined,
  color: string,
  sizes: string[],
): boolean {
  return sizes.some((s) => stockOf(stock, color, s) > 0);
}

/** First colour with any stock, else the first colour. */
export function defaultColor(
  stock: StockMap | undefined,
  colors: { name: string }[],
  sizes: string[],
): string {
  return (colors.find((c) => colorHasStock(stock, c.name, sizes)) ?? colors[0])?.name ?? '';
}
