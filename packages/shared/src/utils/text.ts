export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Variant key from color + size, e.g. ("Off White", "XL") → "off-white_xl". */
export function variantKey(color: string, size: string): string {
  return `${slugify(color) || 'default'}_${slugify(size) || 'os'}`;
}

/** Inventory doc id for a product variant. */
export function inventoryId(productId: string, key: string): string {
  return `${productId}__${key}`;
}

/**
 * Lowercase prefix tokens for Firestore `array-contains` search, e.g. "Linen Shirt" →
 * ["l","li","lin","line","linen","s","sh",…]. Capped to keep docs small.
 */
export function buildSearchKeywords(...parts: (string | string[] | undefined)[]): string[] {
  const words = new Set<string>();
  for (const part of parts.flat()) {
    if (!part) continue;
    for (const word of part.toLowerCase().split(/[^a-z0-9]+/)) {
      if (word.length < 2) continue;
      for (let i = 2; i <= Math.min(word.length, 15); i++) words.add(word.slice(0, i));
    }
  }
  return [...words].slice(0, 200);
}

export function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}
