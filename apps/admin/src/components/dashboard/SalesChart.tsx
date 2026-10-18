import { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts';
import { formatKES } from '@areqa/shared';

interface Day {
  date: Date;
  value: number;
  orders: number;
}

const SERIES = '#1F7A3A'; // mint-deep: passes contrast vs white (validated)
const GRID = '#E4E8E4';
const dayFmt = new Intl.DateTimeFormat('en-KE', { day: 'numeric', month: 'short' });
const compact = (n: number) => (n >= 1000 ? `${Math.round(n / 100) / 10}k` : String(n));

function ChartTooltip({ active, payload }: TooltipContentProps<number, string>) {
  if (!active || !payload?.length) return null;
  const d = payload[0]!.payload as Day;
  return (
    <div className="border-line bg-paper shadow-soft rounded border px-3 py-2 text-xs">
      <p className="font-semibold">{dayFmt.format(d.date)}</p>
      <p className="mt-1 tabular-nums">{formatKES(d.value)}</p>
      <p className="text-muted tabular-nums">
        {d.orders} {d.orders === 1 ? 'order' : 'orders'}
      </p>
    </div>
  );
}

export function SalesChart({ days }: { days: Day[] }) {
  const [asTable, setAsTable] = useState(false);
  const total = days.reduce((n, d) => n + d.value, 0);
  const count = days.reduce((n, d) => n + d.orders, 0);

  return (
    <section className="card p-5" aria-labelledby="sales-title">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="sales-title" className="text-base uppercase">
            Order value per day
          </h2>
          <p className="text-muted text-xs">
            Last 30 days · all orders except cancelled · {formatKES(total)} from {count} orders
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAsTable((t) => !t)}
          className="text-xs font-medium underline underline-offset-4"
        >
          {asTable ? 'Show chart' : 'View as table'}
        </button>
      </div>
      {asTable ? (
        <div className="max-h-72 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-paper text-muted sticky top-0 text-left text-xs uppercase tracking-wider">
              <tr>
                <th className="py-1.5">Date</th>
                <th className="py-1.5 text-right">Orders</th>
                <th className="py-1.5 text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-line divide-y">
              {[...days].reverse().map((d) => (
                <tr key={d.date.toISOString()}>
                  <td className="py-1.5">{dayFmt.format(d.date)}</td>
                  <td className="py-1.5 text-right tabular-nums">{d.orders}</td>
                  <td className="py-1.5 text-right tabular-nums">{formatKES(d.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          className="h-64"
          role="img"
          aria-label={`Order value per day for the last 30 days, totalling ${formatKES(total)}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={days} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke={GRID} strokeWidth={1} />
              <XAxis
                dataKey="date"
                tickFormatter={(d: Date) => dayFmt.format(d)}
                tick={{ fontSize: 11, fill: '#6B6F6B' }}
                axisLine={{ stroke: GRID }}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={28}
              />
              <YAxis
                tickFormatter={compact}
                tick={{ fontSize: 11, fill: '#6B6F6B' }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                content={(p) => <ChartTooltip {...(p as TooltipContentProps<number, string>)} />}
                cursor={{ stroke: '#0B0B0B', strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={SERIES}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                fill={SERIES}
                fillOpacity={0.1}
                activeDot={{ r: 5, fill: SERIES, stroke: '#FFFFFF', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
