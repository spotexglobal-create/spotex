import type { Metadata } from 'next';
import Link from 'next/link';
import { STATUS, initials, quoteDate } from '@/components/admin/quote-ui';
import { Card, Icon, PageHeader, Pill, StatCards } from '@/components/admin/ui';
import { INQUIRIES_PER_PAGE, getInquiries, getInquiriesPerDay, getInquiryCounts, isInquiryStatus, type Inquiry } from '@/lib/admin/inquiries';
import { dbConfigured } from '@/lib/db/connect';
import { INQUIRY_STATUSES } from '@/lib/db/models';

export const metadata: Metadata = { title: 'Quote requests' };

type Props = { searchParams: Promise<{ status?: string; page?: string; deleted?: string }> };

export default async function QuotesPage({ searchParams }: Props) {
  const { status: rawStatus, page: rawPage, deleted } = await searchParams;
  const status = isInquiryStatus(rawStatus) ? rawStatus : undefined;
  const page = Math.max(1, Number.parseInt(rawPage ?? '1', 10) || 1);
  const [counts, items, perDay] = await Promise.all([getInquiryCounts('quote'), getInquiries(status, page, 'quote'), getInquiriesPerDay(30, 'quote')]);
  const total = status ? counts[status] : counts.all;
  const pages = Math.max(1, Math.ceil(total / INQUIRIES_PER_PAGE));
  const href = (s?: string, p = 1) => `/admin/quotes?${new URLSearchParams({ ...(s ? { status: s } : {}), ...(p > 1 ? { page: String(p) } : {}) })}`;
  const last30 = perDay.reduce((n, d) => n + d.count, 0);
  const closed = counts.won + counts.lost;

  return (
    <>
      <PageHeader eyebrow="Sales" title="Quote requests" text="Quote requests from the website, newest first. Click one to open it. General questions are under Messages." />

      <StatCards
        items={[
          { label: 'All requests', value: counts.all, icon: 'quotes', href: href() },
          { label: 'New', value: counts.new, icon: 'mail', href: href('new'), hint: 'Waiting for a reply', alert: counts.new > 0 },
          { label: 'Last 30 days', value: last30, icon: 'dashboard' },
          { label: 'Won', value: counts.won, icon: 'products', href: href('won'), hint: closed ? `${Math.round((counts.won / closed) * 100)}% of closed requests` : undefined },
        ]}
      />

      {!dbConfigured() && (
        <p className="mb-5 rounded-2xl border border-amber-500/30 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <b>Database not connected.</b> Requests are only sent by e-mail (or WhatsApp) for now.
        </p>
      )}
      {deleted === '1' && <p className="mb-5 rounded-2xl border border-emerald-600/25 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">Request deleted.</p>}

      <nav className="mb-5 flex flex-wrap gap-2" aria-label="Filter by status">
        {[{ key: undefined, label: 'All', n: counts.all }, ...INQUIRY_STATUSES.map((s) => ({ key: s, label: STATUS[s].label, n: counts[s] }))].map((t) => (
          <Link
            key={t.label}
            href={href(t.key)}
            className={`rounded-full px-4 py-2 text-xs font-bold ${status === t.key ? 'bg-ink text-white' : 'border border-ink bg-white text-ink/70 hover:border-brand'}`}
          >
            {t.label} <span className="ml-1 opacity-60">{t.n}</span>
          </Link>
        ))}
      </nav>

      {items.length ? (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-ink/10">
            {items.map((q) => (
              <Row key={q.id} q={q} />
            ))}
          </ul>
        </Card>
      ) : (
        <Card className="flex flex-col items-center px-6 py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-ink/[0.04] text-ink/60">
            <Icon name="quotes" className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-base font-bold text-ink">{status ? `No “${STATUS[status].label}” requests` : 'No quote requests yet'}</h2>
          <p className="mt-1 max-w-md text-sm text-ink/70">Every request from the website (customer, products, quantity and message) appears here.</p>
        </Card>
      )}

      {pages > 1 && (
        <div className="mt-5 flex items-center justify-between text-xs font-semibold text-ink/75">
          <span>
            Page {page} of {pages}
          </span>
          <span className="flex gap-2">
            {page > 1 && (
              <Link href={href(status, page - 1)} className="rounded-lg px-3 py-2 hover:bg-ink/5">
                ← Newer
              </Link>
            )}
            {page < pages && (
              <Link href={href(status, page + 1)} className="rounded-lg px-3 py-2 hover:bg-ink/5">
                Older →
              </Link>
            )}
          </span>
        </div>
      )}
    </>
  );
}

function Row({ q }: { q: Inquiry }) {
  const s = STATUS[q.status];
  const products = [q.product, ...q.products].filter(Boolean);

  return (
    <li>
      <Link href={`/admin/quotes/${q.id}`} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-ink/[0.025]">
        <span className="relative grid h-11 w-11 flex-none place-items-center rounded-full bg-ink text-sm font-bold text-white">
          {initials(q.name)}
          {q.status === 'new' && <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-brand" aria-label="New" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-[15px] font-bold text-ink">{q.name}</span>
            {q.company && <span className="hidden truncate text-sm text-ink/70 sm:inline">· {q.company}</span>}
          </span>
          <span className="mt-0.5 block truncate text-xs text-ink/70">
            <b className="font-bold text-ink/70">{q.kind === 'quote' ? 'Quote' : 'Message'}</b>
            {products.length > 0 && ` · ${products.join(', ')}`}
            {q.quantity && ` · ${q.quantity} pcs`}
            {q.country && ` · ${q.country}`}
          </span>
        </span>
        <span className="hidden flex-none text-xs font-semibold text-ink/65 md:block">{quoteDate(q.createdAt)}</span>
        <Pill tone={s.tone}>{s.label}</Pill>
        <Icon name="chevron" className="h-4 w-4 flex-none -rotate-90 text-ink/60" />
      </Link>
    </li>
  );
}
