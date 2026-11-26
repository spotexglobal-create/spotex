import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { ContactActions } from '@/components/ui/ContactActions';
import { Link } from '@/i18n/navigation';
import { initLocale, type LocaleParams } from '@/i18n/server';
import { localeAlternates } from '@/lib/seo';
import { getSite } from '@/lib/site';

/** Photos for the opening collage: BJJ gi, judo uniform, MMA shorts. */
const HERO_IMAGES = [
  '/products/jiu-jitsu-uniforms-si-jju-1001-631636-1775541913.webp',
  '/products/judo-uniforms-si-ju-1003-153351-1775543799.webp',
  '/products/mma-shorts-si-ms-1001-813389-1775545568.webp',
];

export async function generateMetadata({ params }: LocaleParams) {
  const locale = initLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'AboutPage' });
  return { title: t('metaTitle'), description: t('metaDescription'), alternates: localeAlternates(locale, '/about') };
}

export default async function AboutPage({ params }: LocaleParams) {
  initLocale((await params).locale);
  const site = await getSite();
  const [t, nav, film, common] = await Promise.all([
    getTranslations('AboutPage'),
    getTranslations('Nav'),
    getTranslations('Film'),
    getTranslations('Common'),
  ]);
  const values = t.raw('values') as { title: string; text: string }[];
  const story = t.raw('story') as { title: string; text: string }[];
  const partners = t.raw('partners') as { title: string; text: string }[];
  const markets = ['us', 'no', 'de', 'fr', 'it', 'kr'] as const;
  const years = new Date().getFullYear() - site.foundedYear;

  const facts = [
    { value: String(site.foundedYear), label: t('facts.since') },
    { value: `${site.stats.staff}+`, label: t('facts.staff') },
    { value: `${site.stats.clients}+`, label: t('facts.clients') },
    { value: String(site.stats.departments), label: t('facts.departments') },
  ];

  return (
    <>
      {/* opening: statement, actions and trust points on the left, a photo collage on the right */}
      <section className="container-page pt-24 md:pt-[104px]">
        <nav aria-label="Breadcrumb" className="text-[11px] font-bold tracking-[0.16em] uppercase">
          <ol className="flex items-center gap-2 text-ink/50">
            <li>
              <Link href="/" className="hover:text-brand">
                {nav('home')}
              </Link>
            </li>
            <li aria-hidden className="text-brand">/</li>
            <li className="text-ink">{nav('about')}</li>
          </ol>
        </nav>
        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-14">
          <div>
            <p className="eyebrow">{t('eyebrow')}</p>
            <h1 className="display mt-3 text-[clamp(52px,6.4vw,104px)] leading-[0.88] text-ink">
              {t('titleA')}
              <br />
              <span className="text-brand">{t('titleB')}</span>
            </h1>
            <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-text">{t('intro')}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/contact" className="btn">
                {common('requestQuote')}
              </Link>
              <Link href="/factory" className="btn btn-ghost">
                {t('seeFactory')} →
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2.5 border-t border-ink/10 pt-6">
              {(t.raw('trust') as string[]).map((item) => (
                <li key={item} className="flex items-center gap-2 text-[13px] font-bold text-ink">
                  <span aria-hidden className="h-2 w-2 rotate-45 bg-brand" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* photo collage: one large product, two small ones and the years in business */}
          <div className="grid aspect-[1/1] grid-cols-2 grid-rows-2 gap-3 sm:aspect-[6/5]">
            <div className="relative row-span-2 overflow-hidden rounded-[24px] border-[1.5px] border-ink bg-soft">
              <Image src={HERO_IMAGES[0]} alt="" fill priority sizes="(min-width: 1024px) 22vw, 46vw" className="photo-multiply object-contain p-5" />
              <span className="absolute bottom-3 left-3 rounded-xl bg-ink px-3 py-2 text-white">
                <span className="block text-[9.5px] font-bold tracking-[0.2em] text-brand uppercase">{t('est')}</span>
                <span className="block text-xs font-bold">{t('place')}</span>
              </span>
            </div>
            <div className="relative overflow-hidden rounded-[24px] border-[1.5px] border-ink bg-soft">
              <Image src={HERO_IMAGES[1]} alt="" fill sizes="(min-width: 1024px) 20vw, 46vw" className="photo-multiply object-contain p-4" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative overflow-hidden rounded-[20px] border-[1.5px] border-ink bg-soft">
                <Image src={HERO_IMAGES[2]} alt="" fill sizes="(min-width: 1024px) 10vw, 23vw" className="photo-multiply object-contain p-2" />
              </div>
              <div className="flex flex-col justify-end rounded-[20px] bg-brand p-3 text-white">
                <span className="display text-[clamp(34px,3.6vw,52px)] leading-none">{years}+</span>
                <span className="mt-1 text-[10px] leading-tight font-bold tracking-[0.12em] uppercase">{t('yearsLabel')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* key figures */}
      <section className="container-page py-14">
        <h2 className="sr-only">{t('factsTitle')}</h2>
        <dl className="grid grid-cols-2 overflow-hidden rounded-[22px] border-[1.5px] border-ink lg:grid-cols-4">
          {facts.map((f, i) => (
            <div key={f.label} className={`flex min-w-0 flex-col-reverse p-4 sm:p-6 ${i > 0 ? 'border-l border-ink/10' : ''} ${i > 1 ? 'border-t border-ink/10 lg:border-t-0' : ''}`}>
              <dt className="mt-1 text-[11px] font-bold tracking-[0.16em] text-ink/80 uppercase">{f.label}</dt>
              <dd className="display text-[clamp(36px,5vw,72px)] leading-none text-ink">{f.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* story */}
      <section className="container-page py-10">
        <p className="eyebrow">{t('storyEyebrow')}</p>
        <h2 className="display mt-3 text-[clamp(40px,5vw,72px)] text-ink">{t('storyTitle')}</h2>
        <ol className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
          {story.map((s, i) => (
            <li key={s.title} className="relative">
              {i < story.length - 1 && (
                <span aria-hidden className="absolute top-[21px] right-[-24px] left-[56px] hidden h-[2px] bg-brand/70 md:block" />
              )}
              <span className="relative grid h-11 w-11 place-items-center rounded-full border-2 border-brand bg-white font-[family-name:var(--font-display)] text-xl text-brand">
                {i + 1}
              </span>
              <h3 className="display mt-4 text-3xl leading-none text-ink">{s.title}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-text">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* values */}
      <section className="mt-16 bg-ink py-20 text-white">
        <div className="container-page">
          <p className="eyebrow">{t('valuesEyebrow')}</p>
          <h2 className="display mt-3 text-[clamp(40px,5vw,72px)]">{t('valuesTitle')}</h2>
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {values.map((v, i) => (
              <div key={v.title} className="rounded-[22px] border-[1.5px] border-white/25 p-7">
                <span className="display text-5xl text-brand">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="display mt-3 text-3xl">{v.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-white/90">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* customers and markets */}
      <section className="container-page grid grid-cols-1 gap-12 py-20 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <p className="eyebrow">{t('partnersEyebrow')}</p>
          <h2 className="display mt-3 text-[clamp(36px,4.4vw,60px)] text-ink">{t('partnersTitle')}</h2>
          <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {partners.map((p) => (
              <li key={p.title} className="rounded-[20px] border-[1.5px] border-ink bg-white p-5">
                <p className="text-sm font-bold text-ink">{p.title}</p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-text">{p.text}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[24px] border-[1.5px] border-ink bg-soft p-7">
          <p className="eyebrow">{t('marketsEyebrow')}</p>
          <h2 className="display mt-3 text-4xl text-ink">{t('marketsTitle')}</h2>
          <ul className="mt-6 flex flex-wrap gap-2">
            {markets.map((m) => (
              <li key={m} className="rounded-full border-[1.5px] border-ink bg-white px-4 py-2 text-xs font-bold tracking-[0.1em] text-ink uppercase">
                {film(`export.countries.${m}`)}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm leading-relaxed text-text">{t('marketsText')}</p>
        </div>
      </section>

      {/* next step */}
      <section className="container-page flex flex-col items-start justify-between gap-6 border-t border-ink/10 py-16 md:flex-row md:items-end">
        <div>
          <h2 className="display text-[clamp(40px,5vw,72px)] leading-[0.9] text-ink">{t('ctaTitle')}</h2>
          <p className="mt-3 max-w-lg text-[15.5px] leading-relaxed text-text">{t('ctaText')}</p>
        </div>
        <ContactActions />
      </section>
    </>
  );
}
