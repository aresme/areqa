import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';

/** Move / remove buttons for an item in an ordered list. */
export function ListControls({
  index,
  count,
  onMove,
  onRemove,
  label,
}: {
  index: number;
  count: number;
  onMove: (to: number) => void;
  onRemove: () => void;
  label: string;
}) {
  return (
    <div className="flex gap-1">
      <button
        type="button"
        disabled={index === 0}
        onClick={() => onMove(index - 1)}
        aria-label={`Move ${label} up`}
        className="hover:bg-mist rounded p-1.5 disabled:opacity-30"
      >
        <ArrowUp className="size-4" />
      </button>
      <button
        type="button"
        disabled={index === count - 1}
        onClick={() => onMove(index + 1)}
        aria-label={`Move ${label} down`}
        className="hover:bg-mist rounded p-1.5 disabled:opacity-30"
      >
        <ArrowDown className="size-4" />
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        className="text-danger-deep hover:bg-danger/10 rounded p-1.5"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
