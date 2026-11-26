import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { SITE } from '@/config/site';
import { Link } from '@/i18n/navigation';
import { getCategories } from '@/lib/catalog';
import { getCatalogText } from '@/lib/catalog/text';
import { NAV_ITEMS } from './nav-items';
import { getSite } from '@/lib/site';
import { SocialLinks } from './SocialLinks';

const HEADING = 'mb-4 text-[11px] font-bold tracking-[0.24em] text-brand uppercase';
const LINK = 'text-white/75 transition-colors hover:text-white';

/** Site footer: dark band with brand, menus and contact, closed by a large outlined wordmark. */
export async function Footer() {
  const [t, categories, text] = await Promise.all([getTranslations(), getCategories(), getCatalogText()]);
  const site = await getSite();
  const year = new Date().getFullYear();

  return (
    <footer className="relative isolate overflow-hidden bg-ink text-sm text-white">
      {/* light wordmark behind the footer content */}
      <p
        aria-hidden
        className="display pointer-events-none absolute inset-x-0 bottom-[-0.12em] -z-10 text-center text-[clamp(120px,24vw,400px)] leading-none text-white/[0.04] select-none"
      >
        Spotex
      </p>
      <div className="container-page pt-16 pb-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.5fr_1fr_1fr_1.3fr]">
          <div>
            <Image src={SITE.logo} alt={SITE.name} width={150} height={48} className="h-11 w-auto rounded-md" />
            <p className="mt-5 max-w-xs leading-7 text-white/75">{t('Footer.tagline')}</p>
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-[11px] font-bold tracking-[0.18em] uppercase">
              <i className="h-2 w-2 rounded-full bg-brand" aria-hidden />
              {t('Footer.since', { year: String(site.foundedYear) })}
            </p>
            <SocialLinks social={site.social} className="mt-6" />
          </div>

          <nav aria-label={t('Footer.explore')}>
            <p className={HEADING}>{t('Footer.explore')}</p>
            <ul className="space-y-2.5">
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
            <ul className="space-y-2.5">
              {categories.map(({ slug }) => (
                <li key={slug}>
                  <Link href={{ pathname: '/products/[category]', params: { category: slug } }} className={LINK}>
                    {text.categoryName(slug)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <address className="not-italic">
            <p className={HEADING}>{t('Footer.contact')}</p>
            <dl className="space-y-4">
              <div>
                <dt className="text-[11px] font-bold tracking-[0.18em] text-white/45 uppercase">{t('Footer.address')}</dt>
                <dd className="mt-1 leading-6 text-white/85">
                  {site.address.street}
                  <br />
                  {site.address.city} {site.address.postalCode}, {site.address.country}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold tracking-[0.18em] text-white/45 uppercase">{t('Footer.phone')}</dt>
                <dd className="mt-1">
                  <a href={`tel:${site.phone.replace(/\s/g, '')}`} className={LINK}>
                    {site.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold tracking-[0.18em] text-white/45 uppercase">{t('Footer.email')}</dt>
                <dd className="mt-1">
                  <a href={`mailto:${site.email}`} className={LINK}>
                    {site.email}
                  </a>
                </dd>
              </div>
            </dl>
          </address>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-white/12 pt-6 text-xs text-white/55">
          <p>
            © {year} {SITE.name}. {t('Footer.rights')}
          </p>
          <p>{t('Footer.madeIn')}</p>
        </div>
      </div>

    </footer>
  );
}
