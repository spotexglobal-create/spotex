import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { whatsappLink } from '@/config/site';
import { Link } from '@/i18n/navigation';
import { getSite } from '@/lib/site';

/** Red contact button: icon in a white circle, small label over the number/address, arrow on the right. */
function ContactButton({ href, external, label, value, icon }: { href: string; external?: boolean; label: string; value: string; icon: ReactNode }) {
  return (
    <a
      href={href}
      {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
      className="flex items-center gap-3 rounded-2xl bg-brand py-2.5 pr-4 pl-2.5 transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-brand-bright"
    >
      <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-white text-brand">
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current" aria-hidden>
          {icon}
        </svg>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[9.5px] font-bold tracking-[0.16em] whitespace-nowrap text-white/80 uppercase">{label}</span>
        <span className="block truncate text-[13px] font-semibold" title={value}>
          {value}
        </span>
      </span>
    </a>
  );
}

/**
 * Closing call to action of the home page: a soft panel with the pitch and buttons on the left,
 * the four steps from enquiry to delivery and the direct contact lines on the right.
 */
export async function HomeCta() {
  const t = await getTranslations();
  const site = await getSite();
  const steps = t.raw('Film.custom.steps') as string[];

  return (
    <section className="container-page py-14 md:py-20">
      <div className="grid overflow-hidden rounded-[32px] border-[1.5px] border-line bg-soft lg:grid-cols-[1.15fr_1fr]">
        {/* pitch */}
        <div className="flex flex-col justify-center p-8 md:px-12 md:py-14">
          <p className="eyebrow">{t('HomeCta.eyebrow')}</p>
          <h2 className="display mt-4 text-[clamp(48px,5.6vw,92px)] text-ink">
            {t('HomeCta.titleA')}
            <br />
            <span className="text-brand">{t('HomeCta.titleB')}</span>
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed">{t('HomeCta.text')}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/contact" className="btn">
              {t('Common.requestQuote')}
            </Link>
            <Link href="/contact" className="btn btn-ghost">
              {t('Common.requestSample')}
            </Link>
          </div>
        </div>

        {/* steps + direct contact */}
        <div className="flex flex-col gap-7 bg-ink p-8 text-white md:px-12 md:py-14">
          <div>
            <p className="text-xs font-bold tracking-[0.24em] text-brand uppercase">{t('Film.custom.stepsTitle')}</p>
            <ol className="mt-3">
              {steps.map((step, i) => (
                <li key={step} className="flex items-center gap-5 border-b border-white/12 py-2.5 last:border-b-0 md:py-3.5">
                  <span className="display w-9 text-2xl text-brand">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-[15px] font-semibold">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* one button per row: the e-mail address is too long for half a row */}
          <div className="mt-auto grid gap-3">
            <ContactButton
              href={whatsappLink(undefined, site.whatsapp)}
              external
              label={t('Common.whatsapp')}
              value={`+${site.whatsapp.replace(/^(\d{2})(\d{3})(\d+)/, '$1 $2 $3')}`}
              icon={
                <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Zm4.6 12.6c-.2.6-1.1 1.1-1.6 1.2-.4 0-.9.1-2.9-.7-2.4-1-4-3.4-4.1-3.6-.1-.2-1-1.3-1-2.5s.6-1.8.9-2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.3 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.8.9c.3.1.4.2.5.3.1.2.1.6-.1 1.2Z" />
              }
            />
            <ContactButton
              href={`mailto:${site.email}`}
              label={t('Footer.email')}
              value={site.email}
              icon={<path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm8 7.2L19 7.6V7H5v.6l7 4.6Zm7-2.2-6.5 4.3a1 1 0 0 1-1 0L5 10v7h14v-7Z" />}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
