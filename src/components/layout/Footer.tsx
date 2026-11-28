import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { SITE } from '@/config/site';
import { Link } from '@/i18n/navigation';
import { getCategories } from '@/lib/catalog';
import { getCatalogText } from '@/lib/catalog/text';
import { NAV_ITEMS } from './nav-items';
import { getSite } from '@/lib/site';
import { SocialLinks } from './SocialLinks';

const HEADING = 'mb-3.5 flex items-center gap-2.5 text-[11px] font-bold tracking-[0.24em] text-white uppercase before:h-[2px] before:w-5 before:bg-brand';
const LINK = 'text-white/70 transition-colors hover:text-white';
/** a small red line icon in front of each contact detail */
const icon = (d: string) => (
  <span aria-hidden className="mt-0.5 grid h-8 w-8 flex-none place-items-center rounded-full bg-brand/15 text-brand">
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  </span>
);

/** Site footer: a compact dark band with brand and social links, menus and contact, and a thin bottom bar. */
export async function Footer() {
  const [t, categories, text] = await Promise.all([getTranslations(), getCategories(), getCatalogText()]);
  const site = await getSite();
  const year = new Date().getFullYear();

  return (
    <footer className="relative isolate overflow-hidden border-t-[3px] border-brand bg-ink text-sm text-white">
      {/* faint wordmark behind the content */}
      <p
        aria-hidden
        className="display pointer-events-none absolute right-[-0.04em] bottom-[-0.14em] -z-10 text-[clamp(110px,17vw,280px)] leading-none text-white/[0.035] select-none"
      >
        Spotex
      </p>
      <div className="container-page pt-12 pb-6">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-[1.35fr_0.9fr_1.4fr_1.45fr] md:gap-x-10">
          <div className="col-span-2 md:col-span-1">
            <Image src={SITE.logo} alt={SITE.name} width={150} height={48} className="h-10 w-auto rounded-md" />
            <p className="mt-4 max-w-xs leading-6 text-white/70">{t('Footer.tagline')}</p>
            <SocialLinks social={site.social} className="mt-5" />
          </div>

          <nav aria-label={t('Footer.explore')}>
            <p className={HEADING}>{t('Footer.explore')}</p>
            <ul className="space-y-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={LINK}>
                    {t(`Nav.${item.label}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t('Footer.categories')}>
            <p className={HEADING}>{t('Footer.categories')}</p>
            <ul className="space-y-2 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-2 sm:space-y-0">
              {categories.map(({ slug }) => (
                <li key={slug}>
                  <Link href={{ pathname: '/products/[category]', params: { category: slug } }} className={LINK}>
                    {text.categoryName(slug)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <address className="col-span-2 min-w-0 not-italic md:col-span-1">
            <p className={HEADING}>{t('Footer.contact')}</p>
            <dl className="space-y-3">
              <div className="flex gap-3">
                {icon('M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z')}
                <div className="min-w-0">
                  <dt className="sr-only">{t('Footer.address')}</dt>
                  <dd className="leading-6 text-white/80">
                    {site.address.street}, {site.address.city} {site.address.postalCode}, {site.address.country}
                  </dd>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {icon('M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z')}
                <div className="min-w-0">
                  <dt className="sr-only">{t('Footer.phone')}</dt>
                  <dd>
                    <a href={`tel:${site.phone.replace(/\s/g, '')}`} className={LINK}>
                      {site.phone}
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {icon('M3 6h18v12H3zM3 6l9 7 9-7')}
                <div className="min-w-0">
                  <dt className="sr-only">{t('Footer.email')}</dt>
                  <dd className="truncate">
                    <a href={`mailto:${site.email}`} className={LINK}>
                      {site.email}
                    </a>
                  </dd>
                </div>
              </div>
            </dl>
          </address>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-white/10 pt-5 text-xs text-white/50">
          <p>
            © {year} {SITE.name}. {t('Footer.rights')}
          </p>
          <p className="flex items-center gap-2">
            <i aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand" />
            {t('Footer.since', { year: String(site.foundedYear) })} · {t('Footer.madeIn')}
          </p>
        </div>
      </div>

    </footer>
  );
}
