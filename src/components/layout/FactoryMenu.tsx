'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { DEPARTMENTS } from '@/data/departments';
import { Link, usePathname } from '@/i18n/navigation';

/**
 * "Factory" item of the main menu with a dropdown: the ten departments in four production phases,
 * plus a card linking to the factory overview. Same open / close behaviour as the products menu.
 */
export function FactoryMenu({ label, active }: { label: string; active: boolean }) {
  const t = useTranslations();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const phases = t.raw('FactoryPage.phases') as { title: string }[];

  const show = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hide = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 160);
  };
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  useEffect(() => () => clearTimeout(closeTimer.current), []);

  return (
    <li onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && hide()}>
      <Link
        href="/factory"
        aria-expanded={open}
        aria-haspopup="true"
        className={`inline-flex items-center gap-1.5 transition-colors hover:text-brand ${active || open ? 'text-brand' : 'text-ink/80'}`}
      >
        {label}
        <svg aria-hidden viewBox="0 0 24 24" className={`h-3 w-3 fill-none stroke-current stroke-[3] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </Link>

      {open && (
        <div className="absolute inset-x-0 top-full z-50 pt-3 normal-case tracking-normal" onMouseEnter={show}>
          <div className="container-page">
            <div className="mx-auto grid max-w-[1120px] grid-cols-[250px_1fr] overflow-hidden rounded-[24px] border-[1.5px] border-ink/15 bg-white shadow-[0_30px_70px_rgba(0,0,0,.14)] animate-[menu-in_.22s_ease-out]">
              {/* overview card */}
              <Link href="/factory" className="group flex flex-col justify-between bg-ink p-6 text-white">
                <span>
                  <span className="text-[10px] font-bold tracking-[0.22em] text-brand uppercase">{t('FactoryPage.eyebrow')}</span>
                  <span className="display mt-2 block text-[34px] leading-[0.95]">
                    {t('FactoryPage.titleA')} <span className="text-brand">{t('FactoryPage.titleB')}</span>
                  </span>
                </span>
                <span className="mt-6 text-[11px] font-bold tracking-[0.14em] text-white/70 uppercase transition-colors group-hover:text-white">
                  {t('FactoryPage.overview')} →
                </span>
              </Link>

              {/* departments by phase */}
              <div className="grid grid-cols-4 gap-4 p-5">
                {phases.map((phase, p) => (
                  <div key={phase.title}>
                    <div className="border-b-[1.5px] border-ink/10 pb-2.5">
                      <span className="inline-block rounded-full bg-brand px-2 py-0.5 text-[9.5px] font-extrabold tracking-[0.12em] text-white uppercase">
                        {t('FactoryPage.phase', { n: p + 1 })}
                      </span>
                      <p className="display mt-1.5 text-lg leading-none text-ink">{phase.title}</p>
                    </div>
                    <ul className="mt-2.5 space-y-1">
                      {DEPARTMENTS.map((d, i) => ({ ...d, n: i + 1 }))
                        .filter((d) => d.phase === p)
                        .map((d) => (
                          <li key={d.key}>
                            <Link
                              href={{ pathname: '/factory/[department]', params: { department: d.key } }}
                              className="group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-semibold text-ink transition-colors hover:bg-soft"
                            >
                              <span className="display w-6 text-base leading-none text-brand">{String(d.n).padStart(2, '0')}</span>
                              <span className="group-hover:text-brand">{t(`Departments.${d.key}.name`)}</span>
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
