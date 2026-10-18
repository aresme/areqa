import { Button } from '@/components/ui/Button';

/** Sticky footer that appears when a section has unsaved edits. */
export function SaveBar({
  dirty,
  saving,
  onSave,
  onReset,
}: {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
}) {
  if (!dirty) return null;
  return (
    <div className="bg-ink text-paper shadow-soft sticky bottom-4 z-10 mt-6 flex items-center justify-between gap-4 rounded-lg px-5 py-3">
      <p className="text-sm">You have unsaved changes. They go live on the store when saved.</p>
      <div className="flex gap-2">
        <button type="button" onClick={onReset} className="text-xs underline" disabled={saving}>
          Discard
        </button>
        <Button size="sm" variant="mint" onClick={onSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save & publish'}
        </Button>
      </div>
    </div>
  );
}
