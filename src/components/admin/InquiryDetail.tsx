import Link from 'next/link';
import type { ReactNode } from 'react';
import { deleteInquiry, updateInquiry } from '@/app/admin/quotes-actions';
import type { Inquiry } from '@/lib/admin/inquiries';
import { INQUIRY_STATUSES, type InquiryStatus } from '@/lib/db/models';
import { MailboxButton } from './MailboxButton';
import { MESSAGE_STATUSES, STATUS, initials, quoteDate } from './quote-ui';
import { Card, CardTitle, Icon, Pill, btnDark, field, fieldLabel } from './ui';

/** Label + value pair; hidden when there is no value. */
function Item({ label, children }: { label: string; children?: ReactNode }) {
  if (!children) return null;
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-bold tracking-[0.14em] text-ink/65 uppercase">{label}</dt>
      <dd className="mt-0.5 text-sm break-words text-ink">{children}</dd>
    </div>
  );
}

const btnOutline =
  'inline-flex items-center gap-2 rounded-full border-[1.5px] border-ink bg-white px-4 py-2.5 text-xs font-bold tracking-[0.08em] text-ink uppercase transition-colors hover:border-brand hover:text-brand';

/**
 * One quote request or message: who sent it, what they asked, reply buttons, status and note.
 * `section` is the list it belongs to (admin/quotes or admin/messages).
 */
export function InquiryDetail({ q, section, saved }: { q: Inquiry; section: 'quotes' | 'messages'; saved?: boolean }) {
  const isQuote = q.kind === 'quote';
  const s = STATUS[q.status];
  const products = [q.product, ...q.products].filter((p): p is string => Boolean(p));
  const phone = q.phone?.replace(/[^\d+]/g, '');
  const statuses: readonly InquiryStatus[] = isQuote ? INQUIRY_STATUSES : MESSAGE_STATUSES;

  return (
    <>
      <Link href={`/admin/${section}`} className="mb-5 inline-flex items-center gap-1.5 text-xs font-bold text-ink/70 hover:text-brand">
        <Icon name="chevron" className="h-3.5 w-3.5 rotate-90" /> {isQuote ? 'All quote requests' : 'All messages'}
      </Link>

      {/* header */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <span className="grid h-16 w-16 flex-none place-items-center rounded-full bg-ink text-xl font-bold text-white">{initials(q.name)}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold tracking-[0.22em] text-brand uppercase">{isQuote ? 'Quote request' : 'Message'}</p>
          <h1 className="display mt-1 truncate text-[40px] leading-none text-ink">{q.name}</h1>
          <p className="mt-1 text-sm text-ink/70">{[q.company, q.country, quoteDate(q.createdAt)].filter(Boolean).join(' · ')}</p>
        </div>
        <Pill tone={s.tone}>{s.label}</Pill>
      </div>

      {saved && (
        <p className="mb-5 rounded-2xl border border-emerald-600/25 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">Saved.</p>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* a message is mostly its text, so it comes first */}
          {!isQuote && (
            <Card>
              <CardTitle title="Message">
                <span className="text-xs font-semibold text-ink/65">{quoteDate(q.createdAt)}</span>
              </CardTitle>
              <p className="p-5 text-[15px] leading-relaxed whitespace-pre-line text-ink">{q.message || '—'}</p>
            </Card>
          )}

          <div className={`grid gap-6 ${isQuote ? 'md:grid-cols-2' : ''}`}>
            <Card>
              <CardTitle title={isQuote ? 'Customer' : 'Sender'} />
              <dl className={`gap-x-6 gap-y-3.5 p-5 ${isQuote ? 'space-y-3.5' : 'grid sm:grid-cols-2'}`}>
                <Item label="E-mail">
                  <a href={`mailto:${q.email}`} className="font-semibold hover:text-brand">
                    {q.email}
                  </a>
                </Item>
                <Item label="Phone / WhatsApp">{q.phone}</Item>
                <Item label="Company">{q.company}</Item>
                <Item label="Country">{q.country}</Item>
                <Item label="Website language">{q.locale?.toUpperCase()}</Item>
              </dl>
            </Card>

            {isQuote && (
              <Card>
                <CardTitle title="Request" />
                <dl className="space-y-3.5 p-5">
                  {products.length > 0 && (
                    <Item label="Products">
                      <span className="mt-1 flex flex-wrap gap-1.5">
                        {products.map((p) => (
                          <span key={p} className="rounded-full border border-ink px-2.5 py-0.5 text-xs font-semibold">
                            {p}
                          </span>
                        ))}
                      </span>
                    </Item>
                  )}
                  <Item label="Quantity">{q.quantity && `${q.quantity} pieces`}</Item>
                  <Item label="Sample first">{q.sample ? 'Yes, wants a sample' : 'No'}</Item>
                  <Item label="Branding">{q.branding}</Item>
                  <Item label="Received">{quoteDate(q.createdAt)}</Item>
                </dl>
              </Card>
            )}
          </div>

          {isQuote && q.message && (
            <Card>
              <CardTitle title="Message" />
              <p className="p-5 text-sm leading-relaxed whitespace-pre-line text-ink">{q.message}</p>
            </Card>
          )}

          {/* answering happens in the company mailbox: the alert e-mail's Reply goes straight to the customer */}
          <div className="flex flex-wrap items-center gap-2.5">
            <MailboxButton email={q.email} />
            {phone && (
              <a href={`https://wa.me/${phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className={btnOutline}>
                <Icon name="chat" className="h-4 w-4" /> WhatsApp
              </a>
            )}
            {phone && (
              <a href={`tel:${phone}`} className={btnOutline}>
                <Icon name="phone" className="h-4 w-4" /> Call
              </a>
            )}
          </div>
        </div>

        {/* status panel */}
        <div className="space-y-6">
          <Card>
            <CardTitle title="Status & note" />
            {/* key: re-mount when the status changes elsewhere (e.g. after a reply), so the selected pill follows */}
            <form key={`${q.status}-${q.note ?? ''}`} action={updateInquiry} className="space-y-5 p-5">
              <input type="hidden" name="id" value={q.id} />
              <input type="hidden" name="section" value={section} />
              <fieldset>
                <legend className={fieldLabel}>Status</legend>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {statuses.map((v) => (
                    <label
                      key={v}
                      className="cursor-pointer rounded-full border-[1.5px] border-ink bg-white px-3 py-1.5 text-xs font-bold text-ink transition-colors hover:border-brand has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-white has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand"
                    >
                      <input type="radio" name="status" value={v} defaultChecked={q.status === v} className="sr-only" />
                      {STATUS[v].label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="block">
                <span className={fieldLabel}>Internal note</span>
                <textarea
                  name="note"
                  defaultValue={q.note}
                  rows={5}
                  maxLength={2000}
                  className={field}
                  placeholder={
                    isQuote ? 'Only the team sees this, e.g. price sent, follow up Monday' : 'Only the team sees this, e.g. answered by phone'
                  }
                />
              </label>
              <button type="submit" className={`${btnDark} w-full justify-center`}>
                Save changes
              </button>
            </form>
          </Card>

          <details className="group">
            <summary className="flex w-full cursor-pointer list-none items-center justify-center gap-2 rounded-full border-[1.5px] border-brand bg-white px-4 py-2.5 text-xs font-bold tracking-[0.08em] text-brand uppercase transition-colors hover:bg-brand hover:text-white group-open:hidden [&::-webkit-details-marker]:hidden">
              <Icon name="trash" className="h-4 w-4" /> Delete {isQuote ? 'request' : 'message'}
            </summary>
            <form action={deleteInquiry} className="rounded-2xl border-[1.5px] border-brand bg-brand/[0.04] p-4">
              <input type="hidden" name="id" value={q.id} />
              <input type="hidden" name="section" value={section} />
              <p className="text-sm font-bold text-ink">Delete this {isQuote ? 'request' : 'message'}?</p>
              <p className="mt-1 text-xs text-ink/75">It is removed for good and cannot be brought back.</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="submit"
                  className="rounded-full bg-brand px-3 py-2 text-xs font-bold tracking-[0.08em] text-white uppercase hover:bg-brand/90"
                >
                  Yes, delete
                </button>
                <a
                  href={`/admin/${section}/${q.id}`}
                  className="rounded-full border-[1.5px] border-ink bg-white px-3 py-2 text-center text-xs font-bold tracking-[0.08em] text-ink uppercase hover:border-brand hover:text-brand"
                >
                  Cancel
                </a>
              </div>
            </form>
          </details>
        </div>
      </div>
    </>
  );
}
