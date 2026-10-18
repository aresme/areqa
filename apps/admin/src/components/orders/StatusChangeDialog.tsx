import { useState } from 'react';
import { ORDER_STATUS_LABELS, type OrderStatus } from '@areqa/shared';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface Props {
  to: OrderStatus | null;
  hasEmail: boolean;
  onClose: () => void;
  onConfirm: (opts: { note: string; notify: boolean }) => Promise<void>;
}

export function StatusChangeDialog({ to, hasEmail, onClose, onConfirm }: Props) {
  const [note, setNote] = useState('');
  const [notify, setNotify] = useState(true);
  const [busy, setBusy] = useState(false);
  const cancel = to === 'cancelled';
  return (
    <Modal
      open={to !== null}
      onClose={onClose}
      title={
        to ? (cancel ? 'Cancel order?' : `Mark as ${ORDER_STATUS_LABELS[to].toLowerCase()}`) : ''
      }
      className="max-w-md"
    >
      {cancel && (
        <p className="bg-danger/10 text-danger-deep mb-4 rounded p-3 text-sm">
          Stock for every item is returned to inventory and any discount use is released. This
          cannot be undone.
        </p>
      )}
      <label className="block text-sm font-medium">
        Note {cancel ? '(reason, shown to the customer)' : '(optional, shown to the customer)'}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="border-line mt-1.5 w-full rounded border p-2.5 text-sm"
          placeholder={
            cancel ? 'e.g. Customer requested cancellation' : 'e.g. Rider will call when nearby'
          }
        />
      </label>
      <label className="mt-3 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={notify && hasEmail}
          disabled={!hasEmail}
          onChange={(e) => setNotify(e.target.checked)}
          className="accent-ink size-4"
        />
        Email the customer about this update{!hasEmail && ' (EmailJS not configured)'}
      </label>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={busy}>
          Back
        </Button>
        <Button
          className={cancel ? 'bg-danger hover:bg-danger-deep hover:text-paper' : undefined}
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onConfirm({ note: note.trim(), notify: notify && hasEmail });
              setNote('');
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? 'Updating…' : cancel ? 'Cancel order' : 'Confirm'}
        </Button>
      </div>
    </Modal>
  );
}
