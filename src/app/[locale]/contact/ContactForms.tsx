'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useActionState, useState } from 'react';
import { whatsappLink } from '@/config/site';
import { sendInquiry, type InquiryState } from './actions';

const FIELD =
  'mt-1.5 w-full rounded-xl border-[1.5px] border-ink/25 bg-white px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-ink';
const LABEL = 'text-[11px] font-bold tracking-[0.14em] text-ink uppercase';

/**
 * Two forms in one card: a detailed quote request and a simple message.
 * `product` / `sample` come from links such as "Request a quote" on a product page.
 */
export function ContactForms({
  categories,
  product,
  sample,
}: {
  categories: string[];
  product?: string;
  sample?: boolean;
}) {
  const t = useTranslations('ContactForm');
  const locale = useLocale();
  const [tab, setTab] = useState<'quote' | 'message'>('quote');
  const [state, action, pending] = useActionState<InquiryState, FormData>(sendInquiry, { status: 'idle' });
  const bad = (field: string) => state.status === 'invalid' && state.errors?.includes(field);

  if (state.status === 'sent') {
    return (
      <div className="rounded-[24px] border-[1.5px] border-ink bg-white p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand text-white">
          <svg viewBox="0 0 16 16" aria-hidden className="h-6 w-6 fill-none stroke-current stroke-[2.4]">
            <path d="m3 8.5 3 3 7-7" />
          </svg>
        </span>
        <h2 className="display mt-4 text-4xl text-ink">{t('sentTitle')}</h2>
        <p className="mt-2 text-sm">{t('sentText')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border-[1.5px] border-ink bg-white">
      {/* switch between the two forms */}
      <div role="tablist" className="grid grid-cols-2 gap-1 border-b border-ink/10 p-2">
        {(['quote', 'message'] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`rounded-xl px-4 py-3 text-xs font-bold tracking-[0.1em] uppercase transition-colors ${
              tab === k ? 'bg-ink text-white' : 'text-ink/70 hover:bg-soft hover:text-ink'
            }`}
          >
            {t(k === 'quote' ? 'tabQuote' : 'tabMessage')}
          </button>
        ))}
      </div>

      <form action={action} className="space-y-4 p-6 md:p-7" noValidate>
        <input type="hidden" name="kind" value={tab} />
        <input type="hidden" name="locale" value={locale} />
        {/* honeypot for bots */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

        {state.status === 'invalid' && (
          <p role="alert" className="rounded-xl border-[1.5px] border-brand/30 bg-brand/5 px-4 py-3 text-sm font-semibold text-brand">
            {t('invalid')}
          </p>
        )}
        {state.status === 'offline' && (
          <div role="alert" className="rounded-xl border-[1.5px] border-amber-500/40 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p className="font-semibold">{t('offline')}</p>
            <a
              href={whatsappLink(state.summary)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn mt-3 border-[#25d366] bg-[#25d366] hover:border-[#1ebe5b] hover:bg-[#1ebe5b]"
            >
              {t('offlineButton')}
            </a>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className={LABEL}>{t('name')} *</span>
            <input name="name" required autoComplete="name" className={`${FIELD} ${bad('name') ? 'border-brand' : ''}`} />
          </label>
          <label>
            <span className={LABEL}>{t('email')} *</span>
            <input name="email" type="email" required autoComplete="email" className={`${FIELD} ${bad('email') ? 'border-brand' : ''}`} />
          </label>
        </div>

        {tab === 'quote' && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className={LABEL}>{t('company')}</span>
                <input name="company" autoComplete="organization" className={FIELD} />
              </label>
              <label>
                <span className={LABEL}>{t('phone')}</span>
                <input name="phone" type="tel" autoComplete="tel" className={FIELD} placeholder="+1 …" />
              </label>
              <label>
                <span className={LABEL}>{t('country')}</span>
                <input name="country" autoComplete="country-name" className={FIELD} />
              </label>
              <label>
                <span className={LABEL}>{t('quantity')}</span>
                <select name="quantity" className={FIELD} defaultValue="">
                  <option value="">{t('choose')}</option>
                  {['1–50', '50–200', '200–500', '500–1000', '1000+'].map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {product && (
              <label className="block">
                <span className={LABEL}>{t('productCode')}</span>
                <input name="product" defaultValue={product} className={FIELD} />
              </label>
            )}

            <fieldset>
              <legend className={LABEL}>
                {t('products')}
                {!product && ' *'}
              </legend>
              <div className={`mt-2 flex flex-wrap gap-2 rounded-xl ${bad('products') ? 'ring-2 ring-brand/40 ring-offset-2' : ''}`}>
                {categories.map((c) => (
                  <label key={c} className="cursor-pointer">
                    <input type="checkbox" name="products" value={c} className="peer sr-only" />
                    <span className="inline-flex rounded-full border-[1.5px] border-ink/25 px-3.5 py-2 text-xs font-semibold text-ink transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-brand hover:border-ink">
                      {c}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className={LABEL}>{t('branding')}</span>
                <select name="branding" className={FIELD} defaultValue="">
                  <option value="">{t('choose')}</option>
                  {(t.raw('brandingOptions') as string[]).map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-3 self-end rounded-xl border-[1.5px] border-ink/25 px-4 py-3 text-sm font-semibold">
                <input type="checkbox" name="sample" defaultChecked={sample} className="h-4 w-4 accent-[var(--color-brand)]" />
                {t('sample')}
              </label>
            </div>
          </>
        )}

        <label className="block">
          <span className={LABEL}>
            {t('message')}
            {tab === 'message' && ' *'}
          </span>
          <textarea
            name="message"
            rows={tab === 'quote' ? 4 : 6}
            className={`${FIELD} resize-y ${bad('message') ? 'border-brand' : ''}`}
            placeholder={t(tab === 'quote' ? 'messageQuotePlaceholder' : 'messagePlaceholder')}
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <p className="text-xs text-ink/70">{t('privacy')}</p>
          <button type="submit" disabled={pending} className="btn disabled:opacity-60">
            {pending ? t('sending') : t(tab === 'quote' ? 'sendQuote' : 'sendMessage')}
          </button>
        </div>
      </form>
    </div>
  );
}
