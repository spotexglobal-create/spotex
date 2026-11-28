'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { whatsappLink } from '@/config/site';
import { Link } from '@/i18n/navigation';

/**
 * Shown inside the normal header and footer when a page fails to load (for example a slow database),
 * instead of the browser's blank error screen. "Try again" re-renders the page without a full reload.
 */
export default function PageError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('ErrorPage');

  useEffect(() => {
    console.error(error); // visible in the Vercel logs, with the digest shown to support
  }, [error]);

  return (
    <section className="container-page flex min-h-[80vh] flex-col items-start justify-center pt-24 pb-16">
      <p className="eyebrow">Error{error.digest ? ` · ${error.digest}` : ''}</p>
      <h1 className="display mt-4 text-[clamp(48px,8vw,110px)] text-ink">{t('title')}</h1>
      <p className="mt-3 max-w-lg text-[15.5px] leading-relaxed">{t('text')}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="btn">
          {t('retry')}
        </button>
        <Link href="/" className="btn btn-ghost">
          {t('back')}
        </Link>
        <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
          WhatsApp
        </a>
      </div>
    </section>
  );
}
