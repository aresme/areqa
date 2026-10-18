import { deliveryFeeFor, resolveZone, type DeliveryMethod } from '@areqa/shared';
import { useDeliveryZones, useSettings } from '@/features/content/hooks';

export interface DeliveryQuote {
  zone: ReturnType<typeof resolveZone> | null;
  fee: number | null;
  zoneFee: number;
  estimatedDays: string;
  free: boolean;
}

/** Delivery fee for the chosen location. `fee` is null until a county is chosen. */
export function useDeliveryQuote(
  method: DeliveryMethod,
  county: string,
  town: string,
  discountedSubtotal: number,
): DeliveryQuote {
  const { data: zones = [] } = useDeliveryZones();
  const { settings } = useSettings();
  if (method === 'pickup')
    return { zone: null, fee: 0, zoneFee: 0, estimatedDays: 'Ready in 1 working day', free: true };
  const zone = county ? resolveZone(zones, county, town) : null;
  if (!zone) return { zone: null, fee: null, zoneFee: 0, estimatedDays: '', free: false };
  const fee = deliveryFeeFor(zone.fee, discountedSubtotal, settings.freeDeliveryThreshold);
  return { zone, fee, zoneFee: zone.fee, estimatedDays: zone.estimatedDays, free: fee === 0 };
}
