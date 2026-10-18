import { useQuery } from '@tanstack/react-query';
import { DEFAULT_LOW_STOCK_THRESHOLD, type StoreSettings } from '@areqa/shared';
import { config } from '@/lib/env';
import { fetchDeliveryZones, fetchHomeContent, fetchPagesContent, fetchSettings } from './api';

const LONG = 30 * 60_000;

/** Used before settings load or if the doc is missing, so the layout never breaks. */
export const FALLBACK_SETTINGS: StoreSettings = {
  storeName: 'Areqa',
  tagline: 'Modern fashion, made for Kenya.',
  logo: null,
  contactEmail: '',
  orderAlertEmail: '',
  phone: '',
  whatsappNumber: config.whatsappFallback,
  address: '',
  pickupLocation: '',
  businessHours: '',
  social: { instagram: '', tiktok: '', facebook: '', x: '' },
  freeDeliveryThreshold: 0,
  lowStockThreshold: DEFAULT_LOW_STOCK_THRESHOLD,
  sizeGuides: {},
};

export function useSettings() {
  const q = useQuery({ queryKey: ['settings'], queryFn: fetchSettings, staleTime: LONG });
  return { ...q, settings: q.data ?? FALLBACK_SETTINGS };
}

export const useHomeContent = () =>
  useQuery({ queryKey: ['content', 'home'], queryFn: fetchHomeContent, staleTime: LONG });

export const usePagesContent = () =>
  useQuery({ queryKey: ['content', 'pages'], queryFn: fetchPagesContent, staleTime: LONG });

export const useDeliveryZones = () =>
  useQuery({ queryKey: ['deliveryZones'], queryFn: fetchDeliveryZones, staleTime: LONG });
