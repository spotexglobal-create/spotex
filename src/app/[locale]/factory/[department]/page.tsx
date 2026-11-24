import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ContactActions } from '@/components/ui/ContactActions';
import { DEPARTMENTS, isDepartment } from '@/data/departments';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { initLocale, type LocaleParams } from '@/i18n/server';
import { localeAlternates } from '@/lib/seo';

type Props = LocaleParams<{ department: string }>;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => DEPARTMENTS.map((d) => ({ locale, department: d.key })));
}

export async function generateMetadata({ params }: Props) {
  const { locale: raw, department } = await params;
  const locale = initLocale(raw);
  if (!isDepartment(department)) return {};
  const [t, factory] = await Promise.all([
    getTranslations({ locale, namespace: 'Departments' }),
    getTranslations({ locale, namespace: 'FactoryPage' }),
  ]);
  return {
    title: `${t(`${department}.name`)} · ${factory('metaTitle')}`,
    description: t(`${department}.lead`),
    alternates: localeAlternates(locale, { pathname: '/factory/[department]', params: { department } }),
  };
}

export default async function DepartmentPage({ params }: Props) {
  const { locale, department } = await params;
  initLocale(locale);
  if (!isDepartment(department)) notFound();

  const [t, factory, nav] = await Promise.all([getTranslations('Departments'), getTranslations('FactoryPage'), getTranslations('Nav')]);
  const index = DEPARTMENTS.findIndex((d) => d.key === department);
  const dept = DEPARTMENTS[index];
  const prev = DEPARTMENTS[index - 1];
  const next = DEPARTMENTS[index + 1];
  const phases = factory.raw('phases') as { title: string; text: string }[];
  const points = t.raw(`${department}.points`) as string[];
  const number = String(index + 1).padStart(2, '0');

  return (
    <>
      <section className="container-page pt-24 md:pt-[104px]">
        <nav aria-label="Breadcrumb" className="text-[11px] font-bold tracking-[0.16em] uppercase">
          <ol className="flex flex-wrap items-center gap-2 text-ink/50">
            <li>
              <Link href="/" className="hover:text-brand">
                {nav('home')}
              </Link>
            </li>
            <li aria-hidden className="text-brand">/</li>
            <li>
              <Link href="/factory" className="hover:text-brand">
                {nav('factory')}
              </Link>
            </li>
            <li aria-hidden className="text-brand">/</li>
            <li className="text-ink">{t(`${department}.name`)}</li>
          </ol>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-14">
          <div>
            <p className="text-[11px] font-extrabold tracking-[0.2em] text-brand uppercase">
              {factory('phase', { n: dept.phase + 1 })} · {phases[dept.phase].title}
            </p>
            <div className="mt-3 flex items-end gap-4">
              <span className="display text-[clamp(72px,8vw,128px)] leading-[0.8] text-brand">{number}</span>
              <span className="display pb-1 text-2xl text-ink/30">/ 10</span>
            </div>
            <h1 className="display mt-4 text-[clamp(48px,5.6vw,88px)] leading-[0.9] text-ink">{t(`${department}.name`)}</h1>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed">{t(`${department}.lead`)}</p>

            <ul className="mt-7 space-y-2.5">
              {points.map((pt) => (
                <li key={pt} className="flex items-start gap-3 rounded-2xl border-[1.5px] border-ink/25 bg-white px-4 py-3 text-[15px] font-semibold text-ink">
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

          <div className="space-y-4 lg:sticky lg:top-28">
            <div className="relative aspect-[5/4] overflow-hidden rounded-[28px] border-[1.5px] border-ink bg-soft">
              <Image src={dept.image} alt="" fill priority sizes="(min-width: 1024px) 40vw, 92vw" className="photo-multiply object-contain p-6" />
              <span className="absolute top-4 left-4 rounded-full bg-ink px-3 py-1.5 text-[10.5px] font-extrabold tracking-[0.14em] text-white uppercase">
                {factory('inHouse')}
              </span>
            </div>
            <div className="rounded-[22px] bg-ink p-6 text-white">
              <p className="text-[11px] font-bold tracking-[0.2em] text-brand uppercase">{factory('forYou')}</p>
              <p className="mt-2 text-[17px] leading-snug font-semibold">{t(`${department}.benefit`)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* where this step sits in production */}
      <section className="container-page py-16">
        <h2 className="text-[11px] font-bold tracking-[0.2em] text-ink uppercase">{factory('allDepartments')}</h2>
        <ol className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {DEPARTMENTS.map((d, i) => {
            const current = d.key === department;
            return (
              <li key={d.key}>
                <Link
                  href={{ pathname: '/factory/[department]', params: { department: d.key } }}
                  aria-current={current ? 'page' : undefined}
                  className={`flex h-full items-center gap-2.5 rounded-2xl border-[1.5px] px-3.5 py-3 text-[13px] font-bold transition-colors ${
                    current ? 'border-ink bg-ink text-white' : 'border-ink/20 bg-white text-ink hover:border-ink'
                  }`}
                >
                  <span className={`display text-xl leading-none ${current ? 'text-brand' : 'text-brand/80'}`}>{String(i + 1).padStart(2, '0')}</span>
                  {t(`${d.key}.name`)}
                </Link>
              </li>
            );
          })}
        </ol>

        {/* previous / next step */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {prev ? (
            <Link
              href={{ pathname: '/factory/[department]', params: { department: prev.key } }}
              className="group rounded-[20px] border-[1.5px] border-ink p-5 transition-colors hover:bg-soft"
            >
              <span className="text-[11px] font-bold tracking-[0.16em] text-ink/70 uppercase">← {factory('previous')}</span>
              <span className="display mt-1 block text-3xl text-ink group-hover:text-brand">{t(`${prev.key}.name`)}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={{ pathname: '/factory/[department]', params: { department: next.key } }}
              className="group rounded-[20px] border-[1.5px] border-ink p-5 text-right transition-colors hover:bg-soft"
            >
              <span className="text-[11px] font-bold tracking-[0.16em] text-ink/70 uppercase">{factory('next')} →</span>
              <span className="display mt-1 block text-3xl text-ink group-hover:text-brand">{t(`${next.key}.name`)}</span>
            </Link>
          )}
        </div>
      </section>

      <section className="container-page flex flex-col items-start justify-between gap-6 border-t border-ink/10 py-16 md:flex-row md:items-end">
        <div>
          <h2 className="display text-[clamp(40px,5vw,72px)] leading-[0.9] text-ink">{factory('ctaTitle')}</h2>
          <p className="mt-3 max-w-lg text-[15.5px] leading-relaxed">{factory('ctaText')}</p>
        </div>
        <ContactActions />
      </section>
    </>
  );
}
