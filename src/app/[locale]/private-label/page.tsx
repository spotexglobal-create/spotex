import { getTranslations } from 'next-intl/server';
import { ContactActions } from '@/components/ui/ContactActions';
import { PageIntro } from '@/components/ui/PageIntro';
import { initLocale, type LocaleParams } from '@/i18n/server';
import { localeAlternates } from '@/lib/seo';

type Item = { title: string; text: string };

export async function generateMetadata({ params }: LocaleParams) {
  const locale = initLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'PrivateLabel' });
  return { title: t('metaTitle'), description: t('metaDescription'), alternates: localeAlternates(locale, '/private-label') };
}

export default async function PrivateLabelPage({ params }: LocaleParams) {
  initLocale((await params).locale);
  const t = await getTranslations('PrivateLabel');
  const steps = t.raw('steps') as Item[];
  const options = t.raw('options') as Item[];

  return (
    <>
      <PageIntro eyebrow={t('eyebrow')} titleA={t('titleA')} titleB={t('titleB')} intro={t('intro')}>
        <ContactActions className="mt-8" />
      </PageIntro>

      <section className="container-page pb-20">
        <h2 className="display text-[clamp(36px,5vw,64px)] text-ink">{t('stepsTitle')}</h2>
        {/* a real sequence, so the numbers carry meaning */}
        <ol className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-5">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-[18px] border-[1.5px] border-ink bg-white p-5">
              <span className="display text-4xl text-brand">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-3 text-sm font-extrabold tracking-[0.08em] uppercase">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-soft py-20">
        <div className="container-page">
          <h2 className="display text-[clamp(36px,5vw,64px)] text-ink">{t('optionsTitle')}</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {options.map((o) => (
              <div key={o.title} className="rounded-[18px] border-[1.5px] border-ink bg-white p-6">
                <h3 className="display text-2xl text-ink">{o.title}</h3>
                <p className="mt-2 text-sm leading-relaxed">{o.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <ContactActions />
      </section>
    </>
  );
}
