import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  id?: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  normalize?: (s: string) => string;
  suggestions?: string[];
}

/** Type and press Enter or comma to add; Backspace on empty removes the last tag. */
export function TagInput({
  id,
  value,
  onChange,
  placeholder = 'Add and press Enter',
  normalize = (s) => s.trim().toLowerCase(),
  suggestions = [],
}: TagInputProps) {
  const [text, setText] = useState('');
  const add = (raw: string) => {
    const t = normalize(raw);
    if (t && !value.includes(t)) onChange([...value, t]);
    setText('');
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add(text);
    } else if (e.key === 'Backspace' && !text && value.length) onChange(value.slice(0, -1));
  };
  const listId = id ? `${id}-suggest` : undefined;
  return (
    <div className="border-line bg-paper focus-within:border-ink flex min-h-11 flex-wrap items-center gap-1.5 rounded border px-2 py-1.5">
      {value.map((t) => (
        <span
          key={t}
          className="bg-mist inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium"
        >
          {t}
          <button
            type="button"
            onClick={() => onChange(value.filter((x) => x !== t))}
            aria-label={`Remove ${t}`}
            className="text-muted hover:text-ink"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        list={listId}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKey}
        onBlur={() => text && add(text)}
        placeholder={value.length ? '' : placeholder}
        className="min-w-24 flex-1 bg-transparent px-1 text-sm outline-none"
      />
      {listId && (
        <datalist id={listId}>
          {suggestions
            .filter((s) => !value.includes(s))
            .map((s) => (
              <option key={s} value={s} />
            ))}
        </datalist>
      )}
    </div>
  );
}
