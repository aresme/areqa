import { useMemo, useState } from 'react';
import { DEFAULT_LOW_STOCK_THRESHOLD, type StoreSettings } from '@areqa/shared';
import { PageHeader } from '@/components/PageHeader';
import { AdminsManager } from '@/components/settings/AdminsManager';
import { SizeGuidesEditor } from '@/components/settings/SizeGuidesEditor';
import { StoreDetailsForm } from '@/components/settings/StoreDetailsForm';
import { ZonesEditor } from '@/components/settings/ZonesEditor';
import { Skeleton } from '@/components/ui/Skeleton';
import { useStoreSettings } from '@/features/settings/storeSettings';
import { cn } from '@/lib/cn';

const DEFAULTS: StoreSettings = {
  storeName: 'Areqa',
  tagline: '',
  logo: null,
  contactEmail: '',
  orderAlertEmail: '',
  phone: '',
  whatsappNumber: '',
  address: '',
  pickupLocation: '',
  businessHours: '',
  social: { instagram: '', tiktok: '', facebook: '', x: '' },
  freeDeliveryThreshold: 0,
  lowStockThreshold: DEFAULT_LOW_STOCK_THRESHOLD,
  sizeGuides: {},
};

const TABS = [
  { id: 'store', label: 'Store details' },
  { id: 'delivery', label: 'Delivery zones' },
  { id: 'sizes', label: 'Size guides' },
  { id: 'admins', label: 'Admin users' },
] as const;

export default function SettingsPage() {
  const { data, isLoading } = useStoreSettings();
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('store');
  // Stable identity: the forms reset their drafts when this object changes.
  const settings = useMemo(
    () => ({ ...DEFAULTS, ...data, social: { ...DEFAULTS.social, ...data?.social } }),
    [data],
  );
  return (
    <>
      <PageHeader title="Settings" description="Owner only." />
      <div className="mb-6 flex gap-1 overflow-x-auto" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'shrink-0 rounded px-4 py-2 text-sm font-medium',
              tab === t.id ? 'bg-ink text-paper' : 'bg-paper text-muted hover:text-ink',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {isLoading ? (
        <Skeleton className="h-96" />
      ) : (
        <>
          {tab === 'store' && <StoreDetailsForm initial={settings} />}
          {tab === 'delivery' && <ZonesEditor />}
          {tab === 'sizes' && <SizeGuidesEditor settings={settings} />}
          {tab === 'admins' && <AdminsManager />}
        </>
      )}
    </>
  );
}
