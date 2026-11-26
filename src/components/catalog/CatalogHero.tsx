import { getTranslations } from 'next-intl/server';
import { whatsappLink } from '@/config/site';
import { Link } from '@/i18n/navigation';
import type { ComponentProps } from 'react';
import { getSite } from '@/lib/site';

type Href = ComponentProps<typeof Link>['href'];

/**
 * Header for the catalogue pages: breadcrumbs, title, a short red rule and the intro on the left;
 * the two ways to get in touch on the right, so buyers can ask without scrolling.
 */
export async function CatalogHero({
  crumbs,
  title,
  intro,
  actions = true,
}: {
  crumbs: { label: string; href?: Href }[];
  title: string;
  intro: string;
  /** Quote + WhatsApp buttons on the right (off on the contact page, which has its own forms). */
  actions?: boolean;
}) {
  const [t, site] = await Promise.all([getTranslations('Common'), getSite()]);
  return (
    <section className="container-page pt-24 pb-8 md:pt-[104px]">
      <nav aria-label="Breadcrumb" className="text-[11px] font-bold tracking-[0.18em] uppercase">
        <ol className="flex flex-wrap items-center gap-2 text-ink/50">
          {crumbs.map((c, i) => (
            <li key={i} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden className="text-brand">/</span>}
              {c.href ? (
                <Link href={c.href} className="transition-colors hover:text-brand">
                  {c.label}
                </Link>
              ) : (
                <span className="text-ink" aria-current="page">
                  {c.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="display mt-3 text-[clamp(40px,12vw,60px)] break-words text-ink md:text-[clamp(52px,6vw,96px)]">{title}</h1>
          <span aria-hidden className="mt-3 block h-[3px] w-14 rounded-full bg-brand" />
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed">{intro}</p>
        </div>
        {actions && (
        <div className="flex flex-none flex-wrap gap-3">
          <Link href="/contact" className="btn">
            {t('requestQuote')}
          </Link>
          <a href={whatsappLink(undefined, site.whatsapp)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            {t('whatsapp')}
          </a>
        </div>
        )}
      </div>
    </section>
  );
}
