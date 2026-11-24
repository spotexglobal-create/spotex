import type { Metadata } from 'next';
import Link from 'next/link';
import { deleteInquiry, updateInquiry } from '@/app/admin/quotes-actions';
import { Card, Icon, PageHeader, Pill, btnDark, field, fieldLabel } from '@/components/admin/ui';
import { INQUIRIES_PER_PAGE, getInquiries, getInquiryCounts, isInquiryStatus, type Inquiry } from '@/lib/admin/inquiries';
import { dbConfigured } from '@/lib/db/connect';
import { INQUIRY_STATUSES, type InquiryStatus } from '@/lib/db/models';

export const metadata: Metadata = { title: 'Quote requests' };

const STATUS: Record<InquiryStatus, { label: string; tone: 'red' | 'amber' | 'grey' | 'green' }> = {
  new: { label: 'New', tone: 'red' },
  replied: { label: 'Replied', tone: 'amber' },
  sample: { label: 'Sample sent', tone: 'grey' },
  won: { label: 'Won', tone: 'green' },
  lost: { label: 'Lost', tone: 'grey' },
};

const date = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Karachi' }).format(new Date(iso));

type Props = { searchParams: Promise<{ status?: string; page?: string }> };

export default async function QuotesPage({ searchParams }: Props) {
  const { status: rawStatus, page: rawPage } = await searchParams;
  const status = isInquiryStatus(rawStatus) ? rawStatus : undefined;
  const page = Math.max(1, Number.parseInt(rawPage ?? '1', 10) || 1);
  const [counts, items] = await Promise.all([getInquiryCounts(), getInquiries(status, page)]);
  const total = status ? counts[status] : counts.all;
  const pages = Math.max(1, Math.ceil(total / INQUIRIES_PER_PAGE));
  const href = (s?: string, p = 1) => `/admin/quotes?${new URLSearchParams({ ...(s ? { status: s } : {}), ...(p > 1 ? { page: String(p) } : {}) })}`;

  return (
    <>
      <PageHeader eyebrow="Sales" title="Quote requests" text="Requests from the website's quote and contact forms, newest first. Open one to read it and change its status." />

      {!dbConfigured() && (
        <p className="mb-5 rounded-2xl border border-amber-500/30 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <b>Database not connected.</b> Requests are only e-mailed (or sent by WhatsApp) until MONGODB_URI is set.
        </p>
      )}

      <nav className="mb-5 flex flex-wrap gap-2" aria-label="Filter by status">
        {[{ key: undefined, label: 'All', n: counts.all }, ...INQUIRY_STATUSES.map((s) => ({ key: s, label: STATUS[s].label, n: counts[s] }))].map((t) => (
          <Link
            key={t.label}
            href={href(t.key)}
            className={`rounded-full px-4 py-2 text-xs font-bold ${status === t.key ? 'bg-ink text-white' : 'border border-ink/10 bg-white text-ink/60 hover:border-ink/30'}`}
          >
            {t.label} <span className="ml-1 opacity-60">{t.n}</span>
          </Link>
        ))}
      </nav>

      {items.length ? (
        <ul className="space-y-3">
          {items.map((q) => (
            <Row key={q.id} q={q} />
          ))}
        </ul>
      ) : (
        <Card className="flex flex-col items-center px-6 py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-ink/[0.04] text-ink/40">
            <Icon name="quotes" className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-base font-bold text-ink">{status ? `No “${STATUS[status].label}” requests` : 'No quote requests yet'}</h2>
          <p className="mt-1 max-w-md text-sm text-ink/55">Every request from the website (customer, products, quantity and message) appears here.</p>
        </Card>
      )}

      {pages > 1 && (
        <div className="mt-5 flex items-center justify-between text-xs font-semibold text-ink/60">
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
  const what = q.kind === 'quote' ? [q.product, ...q.products].filter(Boolean).join(', ') || 'Quote request' : 'Message';
  const details: [string, string | undefined][] = [
    ['E-mail', q.email],
    ['Company', q.company],
    ['Phone / WhatsApp', q.phone],
    ['Country', q.country],
    ['Product code', q.product],
    ['Products', q.products.join(', ') || undefined],
    ['Quantity', q.quantity],
    ['Sample first', q.kind === 'quote' ? (q.sample ? 'Yes' : 'No') : undefined],
    ['Branding', q.branding],
    ['Website language', q.locale?.toUpperCase()],
  ];

  return (
    <li>
      <details className="group overflow-hidden rounded-[20px] border border-ink/10 bg-white open:border-ink/25">
        <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4 hover:bg-ink/[0.015]">
          <span className="w-28 flex-none text-xs font-semibold text-ink/50">{date(q.createdAt)}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold text-ink">
              {q.name}
              {q.company && <span className="font-semibold text-ink/50"> · {q.company}</span>}
            </span>
            <span className="block truncate text-xs text-ink/55">
              {what}
              {q.quantity && ` · ${q.quantity}`}
              {q.country && ` · ${q.country}`}
            </span>
          </span>
          <Pill tone={s.tone}>{s.label}</Pill>
        </summary>

        <div className="grid gap-6 border-t border-ink/10 p-5 lg:grid-cols-[1fr_300px]">
          <div>
            <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              {details
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[11px] font-bold tracking-[0.12em] text-ink/45 uppercase">{k}</dt>
                    <dd className="break-words text-ink">{v}</dd>
                  </div>
                ))}
            </dl>
            {q.message && <p className="mt-4 rounded-xl bg-ink/[0.03] p-4 text-sm whitespace-pre-line text-ink">{q.message}</p>}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
              <a href={`mailto:${q.email}?subject=${encodeURIComponent('Your request to Spotex International')}`} className={btnDark}>
                <Icon name="mail" className="h-4 w-4" /> Reply by e-mail
              </a>
              {q.phone && (
                <a
                  href={`https://wa.me/${q.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-ink/60 hover:text-brand"
                >
                  WhatsApp
                </a>
              )}
              <span className="text-ink/40">{q.emailed ? 'E-mail notification sent' : 'No e-mail notification was sent'}</span>
            </div>
          </div>

          <div className="space-y-4">
            <form action={updateInquiry} className="space-y-3">
              <input type="hidden" name="id" value={q.id} />
              <label className="block">
                <span className={fieldLabel}>Status</span>
                <select name="status" defaultValue={q.status} className={field}>
                  {INQUIRY_STATUSES.map((v) => (
                    <option key={v} value={v}>
                      {STATUS[v].label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={fieldLabel}>Internal note</span>
                <textarea name="note" defaultValue={q.note} rows={3} maxLength={2000} className={field} placeholder="Only the team sees this" />
              </label>
              <button type="submit" className={`${btnDark} w-full justify-center`}>
                Save
              </button>
            </form>
            <details className="text-xs">
              <summary className="cursor-pointer font-semibold text-ink/45 hover:text-brand">Delete this request…</summary>
              <form action={deleteInquiry} className="mt-2 flex items-center gap-2">
                <input type="hidden" name="id" value={q.id} />
                <span className="text-ink/55">Removes it for good.</span>
                <button type="submit" className="rounded-full bg-brand px-3 py-1.5 font-bold text-white">
                  Yes, delete
                </button>
              </form>
            </details>
          </div>
        </div>
      </details>
    </li>
  );
}
