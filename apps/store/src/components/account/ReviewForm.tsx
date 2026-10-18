import { useState, type FormEvent } from 'react';
import { Star } from 'lucide-react';
import { Field, Input, Textarea } from '@/components/form/Field';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

export interface ReviewDraft {
  rating: number;
  title: string;
  body: string;
}

export function ReviewForm({
  productName,
  onSubmit,
}: {
  productName: string;
  onSubmit: (r: ReviewDraft) => Promise<void>;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (rating < 1) return setError('Choose a star rating.');
    if (body.trim().length < 10) return setError('Tell us a little more (at least 10 characters).');
    setError('');
    setBusy(true);
    try {
      await onSubmit({ rating, title: title.trim(), body: body.trim() });
    } catch (err) {
      console.error('[review] submit failed', err);
      setError('Could not submit your review. You may have already reviewed this item.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <p className="text-muted text-sm">How did you find the {productName}?</p>
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Rating</legend>
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer" onMouseEnter={() => setHover(n)}>
              <input
                type="radio"
                name="rating"
                value={n}
                checked={rating === n}
                onChange={() => setRating(n)}
                className="peer sr-only"
              />
              <Star
                className={cn(
                  'peer-focus-visible:text-mint-strong size-8 transition-colors',
                  n <= (hover || rating) ? 'fill-ink text-ink' : 'text-line',
                )}
                aria-hidden
              />
              <span className="sr-only">
                {n} star{n > 1 ? 's' : ''}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <Field label="Title" optional>
        {(a) => (
          <Input {...a} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
        )}
      </Field>
      <Field label="Your review">
        {(a) => (
          <Textarea
            {...a}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={2000}
            placeholder="Fit, fabric, how you styled it…"
          />
        )}
      </Field>
      {error && (
        <p role="alert" className="text-danger-deep text-sm">
          {error}
        </p>
      )}
      <Button type="submit" block disabled={busy}>
        {busy ? 'Submitting…' : 'Submit review'}
      </Button>
      <p className="text-muted text-center text-xs">
        Reviews appear on the product page once approved.
      </p>
    </form>
  );
}
