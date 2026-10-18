import { useState } from 'react';
import { MapPin, Plus } from 'lucide-react';
import { formatKenyanPhone, normalizeKenyanPhone, type Address } from '@areqa/shared';
import { AddressForm } from '@/components/account/AddressForm';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import {
  MAX_ADDRESSES,
  newAddressId,
  removeAddress,
  saveAddresses,
  upsertAddress,
} from '@/features/account/addresses';
import { useAuth } from '@/features/auth/authStore';
import { toast } from '@/features/ui/toastStore';

export default function AccountAddresses() {
  const { user, profile } = useAuth();
  const addresses = profile?.addresses ?? [];
  const [editing, setEditing] = useState<Partial<Address> | null>(null);

  const save = async (a: Omit<Address, 'id'>) => {
    const address = {
      ...a,
      phone: normalizeKenyanPhone(a.phone),
      id: editing?.id ?? newAddressId(),
    };
    await saveAddresses(user!.uid, upsertAddress(addresses, address));
    toast.success('Address saved');
    setEditing(null);
  };

  const remove = async (id: string) => {
    await saveAddresses(user!.uid, removeAddress(addresses, id));
    toast.info('Address removed');
  };

  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="section-title text-2xl">Addresses</h2>
        {addresses.length > 0 && addresses.length < MAX_ADDRESSES && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              setEditing({
                name: profile?.displayName,
                phone: profile?.phone ? formatKenyanPhone(profile.phone) : '',
              })
            }
          >
            <Plus className="size-4" /> Add
          </Button>
        )}
      </div>
      {addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No saved addresses"
          body="Save an address for faster checkout."
          action={
            <Button onClick={() => setEditing({ name: profile?.displayName, isDefault: true })}>
              Add address
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <li key={a.id} className="border-line flex flex-col rounded-lg border p-5">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{a.label}</p>
                {a.isDefault && (
                  <span className="bg-mint rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                    Default
                  </span>
                )}
              </div>
              <p className="text-muted mt-2 flex-1 text-sm leading-relaxed">
                {a.name} · {formatKenyanPhone(a.phone)}
                <br />
                {a.address}
                <br />
                {a.town}, {a.county}
              </p>
              <div className="mt-4 flex gap-4 text-sm">
                <button
                  type="button"
                  className="underline underline-offset-4"
                  onClick={() => setEditing({ ...a, phone: formatKenyanPhone(a.phone) })}
                >
                  Edit
                </button>
                {!a.isDefault && (
                  <button
                    type="button"
                    className="underline underline-offset-4"
                    onClick={() =>
                      void saveAddresses(
                        user!.uid,
                        upsertAddress(addresses, { ...a, isDefault: true }),
                      )
                    }
                  >
                    Make default
                  </button>
                )}
                <button
                  type="button"
                  className="text-danger-deep underline underline-offset-4"
                  onClick={() => void remove(a.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit address' : 'New address'}
      >
        {editing && (
          <AddressForm initial={editing} onSave={save} onCancel={() => setEditing(null)} />
        )}
      </Modal>
    </section>
  );
}
