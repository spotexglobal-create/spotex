import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { CertificateGallery } from '@/components/factory/CertificateGallery';
import { ContactActions } from '@/components/ui/ContactActions';
import { Link } from '@/i18n/navigation';
import { initLocale, type LocaleParams } from '@/i18n/server';
import { getCategories } from '@/lib/catalog';
import { getCatalogText } from '@/lib/catalog/text';
import { localeAlternates } from '@/lib/seo';
import { getSite } from '@/lib/site';

/** The ten departments grouped into the four phases of production. */
const PHASES = [
  ['design', 'pattern'],
  ['fabric', 'knitting', 'dyeing'],
  ['cutting', 'printing', 'stitching'],
  ['inspection', 'packing'],
] as const;

/** Certificate scans in /public/certificates, in the same order as FactoryPage.certs in the messages. */
const CERTIFICATES = [
  { src: '/certificates/iso-9001-2015.jpg', group: 'quality' },
  { src: '/certificates/iso-9001-2008-2017.jpg', group: 'quality' },
  { src: '/certificates/iso-9001-2008-2016.jpg', group: 'quality' },
  { src: '/certificates/qms-training-2014.jpg', group: 'quality' },
  { src: '/certificates/pakistan-ju-jitsu-federation.jpg', group: 'sport' },
  { src: '/certificates/punjab-ju-jitsu-association.jpg', group: 'sport' },
  { src: '/certificates/punjab-judo-association.jpg', group: 'sport' },
] as const;

export async function generateMetadata({ params }: LocaleParams) {
  const locale = initLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'FactoryPage' });
  return { title: t('metaTitle'), description: t('metaDescription'), alternates: localeAlternates(locale, '/factory') };
}

export default async function FactoryPage({ params }: LocaleParams) {
  initLocale((await params).locale);
  const site = await getSite();
  const [t, dept, nav, text, categories] = await Promise.all([
    getTranslations('FactoryPage'),
    getTranslations('Departments'),
    getTranslations('Nav'),
    getCatalogText(),
    getCategories(),
  ]);
  const csr = t.raw('csr') as string[];
  const phases = t.raw('phases') as { title: string; text: string }[];
  const qualityPoints = t.raw('qualityPoints') as string[];
  const certs = t.raw('certs') as { title: string; issuer: string; note: string }[];
  let n = 0;

  const stats = [
    { value: String(site.foundedYear), label: t('stats.since') },
    { value: String(site.stats.departments), label: t('stats.departments') },
    { value: `${site.stats.staff}+`, label: t('stats.staff') },
    { value: 'ISO', label: t('stats.iso'), href: '#certificates' },
  ];

  return (
    <>
      {/* opening with the key numbers */}
      <section className="pt-24 pb-6 md:pt-[104px]">
        <div className="container-page">
          <nav aria-label="Breadcrumb" className="text-[11px] font-bold tracking-[0.16em] uppercase">
            <ol className="flex items-center gap-2 text-ink/50">
              <li>
                <Link href="/" className="hover:text-brand">
                  {nav('home')}
                </Link>
              </li>
              <li aria-hidden className="text-brand">/</li>
              <li className="text-ink">{nav('factory')}</li>
            </ol>
          </nav>
          <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-end">
            <div>
              <p className="eyebrow">{t('eyebrow')}</p>
              <h1 className="display mt-3 text-[clamp(52px,7vw,112px)] leading-[0.88] text-ink">
                {t('titleA')}
                <br />
                <span className="text-brand">{t('titleB')}</span>
              </h1>
              <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed">{t('intro')}</p>
            </div>
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[22px] border-[1.5px] border-ink bg-ink/10">
              {stats.map((s) => (
                <div key={s.label} className="group relative flex min-w-0 flex-col-reverse bg-white p-4 sm:p-6">
                  <dt className="mt-1 text-[11px] font-bold tracking-[0.16em] text-ink/85 uppercase">
                    {s.href ? (
                      // the link stretches over the whole tile
                      <a href={s.href} className="after:absolute after:inset-0 group-hover:text-brand">
                        {s.label} <span aria-hidden className="text-brand">↓</span>
                      </a>
                    ) : (
                      s.label
                    )}
                  </dt>
                  <dd className="display text-[clamp(36px,4.4vw,68px)] leading-none text-ink group-has-[a]:group-hover:text-brand">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* production in four phases */}
      <section className="container-page py-20">
        <div className="max-w-2xl">
          <p className="eyebrow">{t('phasesEyebrow')}</p>
          <h2 className="display mt-3 text-[clamp(40px,5vw,72px)] text-ink">{t('phasesTitle')}</h2>
        </div>
        <ol className="relative mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {PHASES.map((keys, p) => (
            <li key={p} className="flex flex-col rounded-[22px] border-[1.5px] border-ink bg-white">
              <div className="border-b border-ink/10 p-5">
                <span className="text-[11px] font-extrabold tracking-[0.18em] text-brand uppercase">
                  {t('phase', { n: p + 1 })}
                </span>
                <h3 className="display mt-1 text-3xl leading-none text-ink">{phases[p].title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-ink/85">{phases[p].text}</p>
              </div>
              <ul className="flex-1 space-y-2.5 p-3">
                {keys.map((key) => {
                  n += 1;
                  return (
                    <li key={key}>
                      <Link
                        href={{ pathname: '/factory/[department]', params: { department: key } }}
                        className="group flex gap-3.5 rounded-2xl border-[1.5px] border-ink/25 bg-white p-4 transition-colors hover:border-ink"
                      >
                      <span className="display w-8 flex-none text-2xl leading-none text-brand">{String(n).padStart(2, '0')}</span>
                      <span>
                        <span className="block text-sm font-bold text-ink group-hover:text-brand">{dept(`${key}.name`)} →</span>
                        <span className="mt-1 block text-[13px] leading-relaxed text-ink/85">{dept(`${key}.text`)}</span>
                      </span>
                    </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      {/* certificates */}
      <section id="certificates" className="scroll-mt-24 border-t border-ink/10 py-20">
        <div className="container-page">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-end">
            <div>
              <p className="eyebrow">{t('certsEyebrow')}</p>
              <h2 className="display mt-3 text-[clamp(40px,5vw,72px)] leading-[0.92] text-ink">{t('certsTitle')}</h2>
              <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed">{t('certsText')}</p>
            </div>
            <div className="flex gap-4 rounded-[22px] border-[1.5px] border-ink bg-white p-5">
              <span className="display grid h-14 w-14 flex-none place-items-center rounded-full bg-brand text-xl text-white">FBR</span>
              <div>
                <p className="text-sm font-bold text-ink">{t('fbrTitle')}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-ink/85">{t('fbrText')}</p>
              </div>
            </div>
          </div>
          <CertificateGallery
            items={CERTIFICATES.map((c, i) => ({ ...c, ...certs[i] }))}
            labels={{
              quality: t('certsQuality'),
              sport: t('certsSport'),
              view: t('certsView'),
              close: t('certsClose'),
              prev: t('previous'),
              next: t('next'),
            }}
          />
        </div>
      </section>

      {/* what comes off the line */}
      <section className="bg-soft py-20">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="display text-[clamp(36px,4.4vw,60px)] text-ink">{t('makeTitle')}</h2>
            <Link href="/products" className="text-xs font-bold tracking-[0.14em] text-brand uppercase hover:underline">
              {nav('products')} →
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {categories.slice(0, 5).map((c) => (
              <Link
                key={c.slug}
                href={{ pathname: '/products/[category]', params: { category: c.slug } }}
                className="group overflow-hidden rounded-[18px] border-[1.5px] border-ink bg-white"
              >
                <span className="relative block aspect-square bg-soft">
                  {c.cover && (
                    <Image src={c.cover} alt="" fill sizes="(min-width: 1024px) 18vw, 45vw" className="photo-multiply object-cover transition-transform duration-500 group-hover:scale-[1.05]" />
                  )}
                </span>
                <span className="block px-4 py-3 text-sm font-bold text-ink">{text.categoryName(c.slug)}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* quality */}
      <section className="container-page grid gap-10 py-20 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <p className="eyebrow">{t('qualityEyebrow')}</p>
          <h2 className="display mt-3 text-[clamp(40px,5vw,72px)] text-ink">{t('qualityTitle')}</h2>
          <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed">{t('quality')}</p>
          <ul className="mt-6 space-y-3">
            {qualityPoints.map((pt) => (
              <li key={pt} className="flex items-start gap-3 text-[15px] font-semibold text-ink">
                <span className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full bg-brand text-white">
                  <svg viewBox="0 0 16 16" aria-hidden className="h-3 w-3 fill-none stroke-current stroke-[2.6]">
                    <path d="m3 8.5 3 3 7-7" />
                  </svg>
                </span>
                {pt}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative overflow-hidden rounded-[28px] bg-ink p-10 text-white">
          <p className="text-[11px] font-bold tracking-[0.22em] text-brand uppercase">{t('certified')}</p>
          <p className="display mt-3 text-[clamp(72px,8vw,120px)] leading-[0.85]">
            ISO
            <br />
            9001
          </p>
          <p className="display text-3xl text-white/60">:2015</p>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/70">{t('isoText')}</p>
          <span aria-hidden className="absolute -right-16 -bottom-16 h-64 w-64 rounded-full border-[28px] border-white/[0.05]" />
        </div>
      </section>

      {/* responsibility */}
      <section className="bg-ink py-20 text-white">
        <div className="container-page">
          <p className="eyebrow">{t('csrEyebrow')}</p>
          <h2 className="display mt-3 text-[clamp(40px,5vw,72px)]">{t('csrTitle')}</h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {csr.map((item, i) => (
              <li key={item} className="rounded-[22px] border border-white/15 p-6">
                <span className="display text-5xl text-brand">{String(i + 1).padStart(2, '0')}</span>
                <p className="mt-3 text-[15px] leading-relaxed text-white/85">{item}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* next step */}
      <section className="container-page flex flex-col items-start justify-between gap-6 py-20 md:flex-row md:items-end">
        <div>
          <h2 className="display text-[clamp(40px,5vw,72px)] leading-[0.9] text-ink">{t('ctaTitle')}</h2>
          <p className="mt-3 max-w-lg text-[15.5px] leading-relaxed text-ink/85">{t('ctaText')}</p>
        </div>
        <ContactActions />
      </section>
    </>
  );
}
