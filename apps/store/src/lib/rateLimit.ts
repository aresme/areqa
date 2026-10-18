/**
 * Client-side throttle for public forms (newsletter, contact, checkout). Not a security
 * boundary (rules are), but it stops accidental double-submits and casual spam.
 */
export function rateLimit(
  key: string,
  { max, windowMs }: { max: number; windowMs: number },
): boolean {
  const storageKey = `areqa-rl:${key}`;
  const now = Date.now();
  try {
    const hits = (JSON.parse(localStorage.getItem(storageKey) ?? '[]') as number[]).filter(
      (t) => now - t < windowMs,
    );
    if (hits.length >= max) return false;
    localStorage.setItem(storageKey, JSON.stringify([...hits, now]));
    return true;
  } catch {
    return true;
  }
}
