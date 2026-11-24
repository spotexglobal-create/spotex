'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';

const LABELS: Record<Locale, string> = { en: 'English', de: 'Deutsch', no: 'Norsk', it: 'Italiano', fr: 'Français' };

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const t = useTranslations('Nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  const choose = (next: Locale) => {
    setOpen(false);
    startTransition(() => {
      // Same page, other language: the localized pathname is resolved from the route params.
      // @ts-expect-error -- params always match the current pathname
      router.replace({ pathname, params }, { locale: next });
    });
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('language')}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 items-center gap-2 rounded-full border-[1.5px] border-ink/20 bg-white/90 px-4 text-xs font-bold tracking-[0.14em] uppercase backdrop-blur disabled:opacity-60"
        disabled={pending}
      >
        <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
        </svg>
        {locale.toUpperCase()}
      </button>
      {open && (
        <ul role="listbox" className="absolute right-0 mt-2 w-40 overflow-hidden rounded-2xl border border-line bg-white py-1 shadow-xl">
          {routing.locales.map((l) => (
            <li key={l}>
              <button
                type="button"
                role="option"
                aria-selected={l === locale}
                onClick={() => choose(l)}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-soft ${l === locale ? 'font-bold text-brand' : ''}`}
              >
                {LABELS[l]}
                <span className="text-[11px] font-bold tracking-widest text-ink/50">{l.toUpperCase()}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
