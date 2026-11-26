import { getTranslations } from 'next-intl/server';
import { CatalogHero } from '@/components/catalog/CatalogHero';
import { whatsappLink } from '@/config/site';
import { initLocale, type LocaleParams } from '@/i18n/server';
import { getCategories } from '@/lib/catalog';
import { getCatalogText } from '@/lib/catalog/text';
import { localeAlternates } from '@/lib/seo';
import { ContactForms } from './ContactForms';
import { getSite } from '@/lib/site';

export async function generateMetadata({ params }: LocaleParams) {
  const locale = initLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'ContactPage' });
  return { title: t('metaTitle'), description: t('metaDescription'), alternates: localeAlternates(locale, '/contact') };
}

type Props = LocaleParams & { searchParams: Promise<{ product?: string; sample?: string }> };

export default async function ContactPage({ params, searchParams }: Props) {
  initLocale((await params).locale);
  const site = await getSite();
  const [{ product, sample }, t, nav, text, categories] = await Promise.all([
    searchParams,
    getTranslations('ContactPage'),
    getTranslations('Nav'),
    getCatalogText(),
    getCategories(),
  ]);

  const cards = [
    {
      label: t('whatsapp'),
      value: `+${site.whatsapp.replace(/^(\d{2})(\d{3})(\d+)/, '$1 $2 $3')}`,
      href: whatsappLink(undefined, site.whatsapp),
      external: true,
      icon: 'M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z',
    },
    { label: t('email'), value: site.email, href: `mailto:${site.email}`, icon: 'M3 6h18v12H3zM3 6l9 7 9-7' },
    { label: t('phone'), value: site.phone, href: `tel:${site.phone.replace(/\s/g, '')}`, icon: 'M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z' },
  ];

  return (
    <>
      <CatalogHero crumbs={[{ label: nav('home'), href: '/' }, { label: nav('contact') }]} title={`${t('titleA')} ${t('titleB')}`} intro={t('intro')} actions={false} />

      <section className="container-page grid grid-cols-1 gap-8 pb-24 lg:grid-cols-[1.45fr_1fr] lg:items-start">
        <ContactForms categories={categories.map((c) => text.categoryName(c.slug))} product={product?.slice(0, 60)} sample={sample === '1'} whatsapp={site.whatsapp} />

        <aside className="space-y-3 lg:sticky lg:top-28">
          {cards.map((c) => (
            <a
              key={c.label}
              href={c.href}
              {...(c.external && { target: '_blank', rel: 'noopener noreferrer' })}
              className="group flex items-center gap-4 rounded-[20px] border-[1.5px] border-ink bg-white p-4 transition-colors hover:bg-soft"
            >
              <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-brand text-white">
                <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 fill-none stroke-current stroke-2" strokeLinejoin="round">
                  <path d={c.icon} />
                </svg>
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] font-bold tracking-[0.16em] text-ink uppercase">{c.label}</span>
                <span className="block truncate text-[15px] font-semibold text-ink group-hover:text-brand">{c.value}</span>
              </span>
            </a>
          ))}
          <div className="rounded-[20px] border-[1.5px] border-ink bg-soft p-5">
            <p className="text-[11px] font-bold tracking-[0.16em] text-ink uppercase">{t('address')}</p>
            <p className="mt-1.5 text-[15px] leading-relaxed text-ink">
              {site.address.street}
              <br />
              {site.address.city} {site.address.postalCode}, {site.address.country}
            </p>
            <p className="mt-4 border-t border-ink/10 pt-4 text-[13px] leading-relaxed text-ink/85">{t('hours')}</p>
          </div>
        </aside>
      </section>
    </>
  );
}
