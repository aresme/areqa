import { useEffect, useState } from 'react';
import { formatKES } from '@areqa/shared';

interface PriceRangeProps {
  min: number;
  max: number;
  value: [number | null, number | null];
  onCommit: (range: [number | null, number | null]) => void;
}

/** Dual-thumb slider built from two native range inputs (keyboard accessible for free). */
export function PriceRange({ min, max, value, onCommit }: PriceRangeProps) {
  const [lo, setLo] = useState(value[0] ?? min);
  const [hi, setHi] = useState(value[1] ?? max);
  useEffect(() => {
    setLo(value[0] ?? min);
    setHi(value[1] ?? max);
  }, [value, min, max]);

  if (max <= min) return null;
  const step = 100;
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const commit = () => onCommit([lo <= min ? null : lo, hi >= max ? null : hi]);
  const thumb =
    'pointer-events-none absolute inset-x-0 top-0 h-5 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-solid [&::-moz-range-thumb]:shadow-soft [&::-moz-range-thumb]:border-ink [&::-moz-range-thumb]:bg-paper [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-solid [&::-webkit-slider-thumb]:shadow-soft [&::-webkit-slider-thumb]:border-ink [&::-webkit-slider-thumb]:bg-paper';

  return (
    <div>
      <div className="relative h-5">
        <div className="bg-line absolute inset-x-0 top-2 h-1 rounded-full" />
        <div
          className="bg-mint-strong absolute top-2 h-1 rounded-full"
          style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
        />
        <input
          type="range"
          aria-label="Minimum price"
          min={min}
          max={max}
          step={step}
          value={lo}
          onChange={(e) => setLo(Math.min(Number(e.target.value), hi - step))}
          onPointerUp={commit}
          onKeyUp={commit}
          className={thumb}
        />
        <input
          type="range"
          aria-label="Maximum price"
          min={min}
          max={max}
          step={step}
          value={hi}
          onChange={(e) => setHi(Math.max(Number(e.target.value), lo + step))}
          onPointerUp={commit}
          onKeyUp={commit}
          className={thumb}
        />
      </div>
      <div className="mt-3 flex justify-between text-sm">
        <span>{formatKES(lo)}</span>
        <span>{formatKES(hi)}</span>
      </div>
    </div>
  );
}
