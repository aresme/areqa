import type { DeliveryZone, WithId } from '../types';
import type { KES } from '../types/common';

const norm = (s: string) => s.trim().toLowerCase();

/**
 * Finds the zone for a county/town. A zone that names the town wins over one that
 * covers the whole county (e.g. "Nakuru Town" beats "Rest of Nakuru County").
 */
export function resolveZone<Z extends DeliveryZone>(
  zones: WithId<Z>[],
  county: string,
  town: string,
): WithId<Z> | null {
  const active = zones.filter((z) => z.isActive && z.counties.includes(county));
  const t = norm(town);
  const byTown = t ? active.find((z) => z.towns.some((x) => norm(x) === t)) : undefined;
  return byTown ?? active.find((z) => z.towns.length === 0) ?? null;
}

/** Delivery is free once the discounted subtotal reaches the threshold. */
export function deliveryFeeFor(zoneFee: KES, discountedSubtotal: KES, freeThreshold: KES): KES {
  return freeThreshold > 0 && discountedSubtotal >= freeThreshold ? 0 : zoneFee;
}
