import { useEffect, useState } from 'react';
import { isValidKenyanPhone, normalizeKenyanPhone, type StoreSettings } from '@areqa/shared';
import { SaveBar } from '@/components/content/SaveBar';
import { FormCard } from '@/components/products/FormCard';
import { SingleImageUpload } from '@/components/products/SingleImageUpload';
import { Field } from '@/components/ui/Field';
import { saveSettings } from '@/features/settings/api';
import { toast } from '@/features/ui/toastStore';
import { useQueryClient } from '@tanstack/react-query';

export function StoreDetailsForm({ initial }: { initial: StoreSettings }) {
  const qc = useQueryClient();
  const [v, setV] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    setV(initial);
    setSaved(initial);
  }, [initial]);
  const dirty = JSON.stringify(v) !== JSON.stringify(saved);
  const up = (patch: Partial<StoreSettings>) => setV({ ...v, ...patch });
  const input = (
    label: string,
    key: keyof StoreSettings,
    opts: { hint?: string; type?: string } = {},
  ) => (
    <Field label={label} hint={opts.hint} error={errors[key]}>
      {(a) => (
        <input
          {...a}
          type={opts.type ?? 'text'}
          value={String(v[key] ?? '')}
          onChange={(e) =>
            up({
              [key]: opts.type === 'number' ? Number(e.target.value) : e.target.value,
            } as Partial<StoreSettings>)
          }
        />
      )}
    </Field>
  );

  const save = async () => {
    const errs: Record<string, string> = {};
    if (!v.storeName.trim()) errs.storeName = 'Required';
    if (v.whatsappNumber && !isValidKenyanPhone(v.whatsappNumber))
      errs.whatsappNumber = 'Use a Kenyan number';
    if (v.phone && !isValidKenyanPhone(v.phone)) errs.phone = 'Use a Kenyan number';
    setErrors(errs);
    if (Object.keys(errs).length) return toast.error('Please fix the highlighted fields');
    setSaving(true);
    try {
      const clean = {
        ...v,
        whatsappNumber: v.whatsappNumber ? normalizeKenyanPhone(v.whatsappNumber) : '',
        freeDeliveryThreshold: Math.max(0, Math.round(v.freeDeliveryThreshold)),
        lowStockThreshold: Math.max(0, Math.round(v.lowStockThreshold)),
      };
      await saveSettings(clean);
      setV(clean);
      setSaved(clean);
      qc.setQueryData(['admin-settings'], clean);
      toast.success('Settings saved');
    } catch (e) {
      toast.error('Could not save', { description: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <FormCard title="Brand">
        <div className="grid gap-4 lg:grid-cols-[160px_1fr]">
          <SingleImageUpload
            label="Logo (optional)"
            aspect={2.5}
            folder="brand"
            value={v.logo}
            onChange={(logo) => up({ logo })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {input('Store name', 'storeName')}
            {input('Tagline', 'tagline')}
          </div>
        </div>
      </FormCard>
      <FormCard
        title="Contact"
        description="Shown in the footer, contact page, emails and WhatsApp buttons."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {input('Contact email', 'contactEmail', { type: 'email' })}
          {input('New order alerts go to', 'orderAlertEmail', {
            type: 'email',
            hint: 'Leave blank to stop order alert emails (saves EmailJS quota).',
          })}
          {input('Phone', 'phone', { type: 'tel' })}
          {input('WhatsApp number', 'whatsappNumber', {
            type: 'tel',
            hint: 'Used for the floating button and "Order via WhatsApp".',
          })}
          {input('Address', 'address')}
          {input('Pickup location', 'pickupLocation', {
            hint: 'Shown when customers choose store pickup.',
          })}
          {input('Business hours', 'businessHours')}
        </div>
      </FormCard>
      <FormCard title="Social links">
        <div className="grid gap-4 sm:grid-cols-2">
          {(['instagram', 'tiktok', 'facebook', 'x'] as const).map((k) => (
            <Field key={k} label={k === 'x' ? 'X (Twitter)' : k[0]!.toUpperCase() + k.slice(1)}>
              {(a) => (
                <input
                  {...a}
                  type="url"
                  placeholder="https://"
                  value={v.social[k]}
                  onChange={(e) => up({ social: { ...v.social, [k]: e.target.value } })}
                />
              )}
            </Field>
          ))}
        </div>
      </FormCard>
      <FormCard title="Store rules">
        <div className="grid gap-4 sm:grid-cols-2">
          {input('Free delivery from (KES)', 'freeDeliveryThreshold', {
            type: 'number',
            hint: '0 turns free delivery off.',
          })}
          {input('Low-stock alert at', 'lowStockThreshold', {
            type: 'number',
            hint: 'Units per variant. Products can override per variant.',
          })}
        </div>
      </FormCard>
      <SaveBar
        dirty={dirty}
        saving={saving}
        onSave={() => void save()}
        onReset={() => setV(saved)}
      />
    </div>
  );
}
