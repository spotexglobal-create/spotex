import Link from 'next/link';
import { Card, CardTitle } from '@/components/admin/ui';

/** Bar chart of quote requests per day. Server rendered; hover tooltips are pure CSS. */

const fmt = (date: string, opts: Intl.DateTimeFormatOptions) => new Date(`${date}T12:00:00Z`).toLocaleDateString('en-GB', { timeZone: 'UTC', ...opts });

export function QuotesChart({ data }: { data: { date: string; count: number }[] }) {
  const total = data.reduce((n, d) => n + d.count, 0);
  const peak = Math.max(0, ...data.map((d) => d.count));
  const maxY = Math.max(4, Math.ceil(peak / 4) * 4);
  const ticks = [maxY, maxY / 2, 0];
  const labelAt = new Set([0, Math.floor((data.length - 1) / 2), data.length - 1]);

  return (
    <Card className="flex flex-col">
      <CardTitle title={`Quote requests · last ${data.length} days`}>
        <Link href="/admin/quotes" className="text-xs font-bold text-brand hover:underline">
          Open inbox
        </Link>
      </CardTitle>

      <div className="flex flex-1 flex-col p-5">
        <p className="display text-4xl leading-none text-ink">
          {total}
          <span className="ml-2 align-middle font-sans text-xs font-semibold text-ink/70">requests</span>
        </p>

        <div className="relative mt-5 flex min-h-[190px] flex-1">
          {/* y axis */}
          <div className="flex w-7 flex-none flex-col justify-between pb-6 text-right text-[10px] font-semibold text-ink/65 tabular-nums">
            {ticks.map((t) => (
              <span key={t} className="-translate-y-1/2 pr-2 last:translate-y-1/2">
                {t}
              </span>
            ))}
          </div>

          <div className="relative flex-1">
            {/* recessive grid */}
            <div aria-hidden className="absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between">
              <span className="border-t border-dashed border-ink/10" />
              <span className="border-t border-dashed border-ink/10" />
              <span className="border-t border-ink/40" />
            </div>

            {/* bars */}
            <ol className="absolute inset-x-0 top-0 bottom-6 flex items-end gap-[2px]" aria-hidden>
              {data.map((d, i) => (
                <li key={d.date} className="group relative flex h-full flex-1 items-end justify-center">
                  {d.count > 0 && (
                    <span className="block w-full max-w-[14px] rounded-t-[4px] bg-brand transition-opacity group-hover:opacity-80" style={{ height: `${(d.count / maxY) * 100}%` }} />
                  )}
                  <span
                    className={`pointer-events-none absolute bottom-full z-10 mb-1 hidden rounded-lg bg-ink px-2.5 py-1.5 text-[11px] whitespace-nowrap text-white group-hover:block ${
                      i < 4 ? 'left-0' : i > data.length - 5 ? 'right-0' : 'left-1/2 -translate-x-1/2'
                    }`}
                  >
                    <b className="font-bold">{d.count}</b> on {fmt(d.date, { day: 'numeric', month: 'short' })}
                  </span>
                </li>
              ))}
            </ol>

            {/* x labels */}
            <div aria-hidden className="absolute inset-x-0 bottom-0 flex gap-[2px] text-[10px] font-semibold text-ink/65">
              {data.map((d, i) => (
                <span key={d.date} className="relative flex-1">
                  {labelAt.has(i) && (
                    <span className={`absolute top-0 whitespace-nowrap ${i === 0 ? 'left-0' : i === data.length - 1 ? 'right-0' : 'left-1/2 -translate-x-1/2'}`}>
                      {fmt(d.date, { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </span>
              ))}
            </div>

            {total === 0 && (
              <p className="absolute inset-x-0 top-1/3 text-center text-xs font-semibold text-ink/65">No requests yet. New ones show up here as they arrive.</p>
            )}
          </div>
        </div>

        <table className="sr-only">
          <caption>Quote requests per day</caption>
          <tbody>
            {data.map((d) => (
              <tr key={d.date}>
                <th scope="row">{d.date}</th>
                <td>{d.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
