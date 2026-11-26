import Image from 'next/image';
import { getFormatter, getTranslations } from 'next-intl/server';
import { CatalogHero } from '@/components/catalog/CatalogHero';
import { getPosts } from '@/lib/blog';
import { Link } from '@/i18n/navigation';
import { initLocale, type LocaleParams } from '@/i18n/server';
import { localeAlternates } from '@/lib/seo';

export async function generateMetadata({ params }: LocaleParams) {
  const locale = initLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'BlogPage' });
  return { title: t('title'), description: t('metaDescription'), alternates: localeAlternates(locale, '/blog') };
}

export default async function BlogPage({ params }: LocaleParams) {
  initLocale((await params).locale);
  const [t, nav, format] = await Promise.all([getTranslations('BlogPage'), getTranslations('Nav'), getFormatter()]);
  const [featured, ...rest] = await getPosts();
  const date = (iso: string) => format.dateTime(new Date(iso), { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <CatalogHero crumbs={[{ label: nav('home'), href: '/' }, { label: t('title') }]} title={t('title')} intro={t('intro')} />

      {featured && (
      <section className="container-page pb-24">
        {/* featured article */}
        <Link
          href={{ pathname: '/blog/[slug]', params: { slug: featured.slug } }}
          className="group grid grid-cols-1 overflow-hidden rounded-[24px] border-[1.5px] border-ink bg-white md:grid-cols-[0.8fr_1.2fr]"
        >
          <span className="relative block aspect-[16/9] bg-soft md:aspect-auto md:h-[250px]">
            <Image src={featured.cover} alt="" fill priority sizes="(min-width: 768px) 55vw, 100vw" className="photo-multiply object-contain p-5 transition-transform duration-700 group-hover:scale-[1.04]" />
            <span className="absolute top-4 left-4 rounded-full bg-brand px-3 py-1.5 text-[10.5px] font-extrabold tracking-[0.14em] text-white uppercase">
              {t('featured')}
            </span>
          </span>
          <span className="flex flex-col justify-center p-6 md:px-8 md:py-6">
            <span className="text-[11px] font-bold tracking-[0.16em] text-brand uppercase">
              {t(`topics.${featured.topic}`)} · {t('minRead', { n: featured.minutes })}
            </span>
            <span className="display mt-2 block text-[clamp(28px,2.8vw,42px)] leading-[0.95] text-ink">{featured.title}</span>
            <span className="mt-3 line-clamp-2 block text-[14.5px] leading-relaxed text-ink/85">{featured.excerpt}</span>
            <span className="mt-4 flex items-center justify-between text-sm">
              <span className="text-ink/50">{date(featured.date)}</span>
              <span className="font-bold text-brand">
                {t('readMore')} <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </span>
            </span>
          </span>
        </Link>

        {/* the rest */}
        {rest.length > 0 && <h2 className="mt-14 text-[11px] font-bold tracking-[0.2em] text-ink uppercase">{t('latest')}</h2>}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {rest.map((p) => (
            <Link
              key={p.slug}
              href={{ pathname: '/blog/[slug]', params: { slug: p.slug } }}
              className="group flex flex-col overflow-hidden rounded-[20px] border-[1.5px] border-ink bg-white transition-transform hover:-translate-y-1"
            >
              <span className="relative block aspect-[4/3] bg-soft">
                <Image src={p.cover} alt="" fill sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 100vw" className="photo-multiply object-contain p-4 transition-transform duration-700 group-hover:scale-[1.05]" />
              </span>
              <span className="flex flex-1 flex-col p-4">
                <span className="text-[10.5px] font-bold tracking-[0.16em] text-brand uppercase">
                  {t(`topics.${p.topic}`)} · {t('minRead', { n: p.minutes })}
                </span>
                <span className="display mt-2 block text-xl leading-tight text-ink">{p.title}</span>
                <span className="mt-2 line-clamp-3 block text-[13.5px] leading-relaxed text-ink/85">{p.excerpt}</span>
                <span className="mt-auto flex items-center justify-between pt-5 text-xs">
                  <span className="text-ink/50">{date(p.date)}</span>
                  <span className="font-bold text-brand">{t('readMore')} →</span>
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>
      )}
    </>
  );
}
