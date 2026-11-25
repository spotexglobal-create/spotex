import Link from 'next/link';
import type { ReactNode } from 'react';

/** Small building blocks shared by the admin pages. */

export const ICONS = {
  dashboard: 'M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z',
  products: 'M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9ZM4 7.5l8 4.5 8-4.5M12 12v9',
  categories: 'M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v4H4zM14 15h6v4h-6z',
  quotes: 'M5 4h14v12H9l-4 4V4ZM8.5 8.5h7M8.5 12h4.5',
  blog: 'M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h7M9 8h3',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14.2 3h-4.4l-.4 2.6a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2 1.2l.4 2.6h4.4l.4-2.6a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z',
  external: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  logout: 'M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10',
  plus: 'M12 5v14M5 12h14',
  edit: 'M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  globe: 'M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Z',
  database: 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3Zm0 0v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  mail: 'M3 6h18v12H3zM3 6l9 7 9-7',
  image: 'M4 5h16v14H4zM4 15l4.5-4.5 4 4 3-3L20 15M15.5 9.5h.01',
  phone: 'M5 4h3.5l1.5 4.5-2.2 1.3a11 11 0 0 0 6.4 6.4l1.3-2.2L20 15.5V19a1 1 0 0 1-1 1A15 15 0 0 1 4 5a1 1 0 0 1 1-1Z',
  chat: 'M4 20l1.4-4.2A8 8 0 1 1 8.3 18.7L4 20Z',
  chevron: 'M6 9l6 6 6-6',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
} as const;

export function Icon({ name, className = 'h-[18px] w-[18px]' }: { name: keyof typeof ICONS; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={`${className} flex-none fill-none stroke-current stroke-[1.8]`} strokeLinecap="round" strokeLinejoin="round">
      <path d={ICONS[name]} />
    </svg>
  );
}

/** "← All products" button at the top of a sub page, back to its list. */
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mb-5 inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-ink/20 bg-white py-1.5 pr-4 pl-2.5 text-xs font-bold text-ink transition-colors hover:border-ink hover:text-brand"
    >
      <Icon name="chevron" className="h-3.5 w-3.5 rotate-90" /> {label}
    </Link>
  );
}

/** Page title row with an optional action area on the right; `back` adds a back button above it. */
export function PageHeader({
  eyebrow,
  title,
  text,
  back,
  children,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  back?: { href: string; label: string };
  children?: ReactNode;
}) {
  return (
    <>
      {back && <BackLink {...back} />}
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          {eyebrow && <p className="text-[11px] font-bold tracking-[0.22em] text-brand uppercase">{eyebrow}</p>}
          <h1 className="display mt-1 text-[44px] leading-none text-ink">{title}</h1>
          {text && <p className="mt-2 max-w-2xl text-sm text-ink/75">{text}</p>}
        </div>
        {children && <div className="flex flex-wrap items-center gap-2.5">{children}</div>}
      </div>
    </>
  );
}

export interface Stat {
  label: string;
  value: ReactNode;
  icon: keyof typeof ICONS;
  href?: string;
  /** Small line under the number. */
  hint?: string;
  /** Red icon, for the number that needs attention. */
  alert?: boolean;
}

/**
 * Row of number cards at the top of an admin page. `large` is the dashboard look;
 * the default is a slim one-line card: icon, label + hint, number on the right.
 */
export function StatCards({ items, large = false }: { items: Stat[]; large?: boolean }) {
  return (
    <div className={`grid grid-cols-2 gap-3 xl:grid-cols-4 ${large ? 'mb-6 sm:gap-4' : 'mb-5'}`}>
      {items.map((s) => {
        const iconCls = `grid flex-none place-items-center rounded-full transition-colors ${
          s.alert ? 'bg-brand text-white' : 'bg-ink/[0.05] text-ink/75 group-hover:bg-brand group-hover:text-white'
        }`;
        const body = large ? (
          <>
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] font-bold tracking-[0.12em] text-ink/70 uppercase">{s.label}</span>
              <span className={`${iconCls} h-9 w-9`}>
                <Icon name={s.icon} className="h-4 w-4" />
              </span>
            </div>
            <p className="display mt-2 truncate text-4xl leading-none text-ink sm:text-5xl">{s.value}</p>
            {s.hint && <p className="mt-1.5 truncate text-xs text-ink/70">{s.hint}</p>}
          </>
        ) : (
          <div className="flex items-center gap-3.5">
            <span className={`${iconCls} h-11 w-11`}>
              <Icon name={s.icon} className="h-[18px] w-[18px]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11px] font-bold tracking-[0.12em] text-ink/75 uppercase">{s.label}</span>
              <span className="mt-0.5 block truncate text-xs text-ink/75">{s.hint ?? ' '}</span>
            </span>
            <span className="display flex-none text-4xl leading-none text-ink">{s.value}</span>
          </div>
        );
        const cls = `group block border border-ink bg-white transition-colors ${large ? 'rounded-[20px] p-4 sm:p-5' : 'rounded-[18px] px-5 py-5'}`;
        return s.href ? (
          <Link key={s.label} href={s.href} className={`${cls} hover:border-brand`}>
            {body}
          </Link>
        ) : (
          <div key={s.label} className={cls}>
            {body}
          </div>
        );
      })}
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[20px] border border-ink bg-white ${className}`}>{children}</section>;
}

export function CardTitle({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-ink/10 px-5 py-4">
      <h2 className="text-sm font-bold text-ink">{title}</h2>
      {children}
    </div>
  );
}

const PILL = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  red: 'bg-brand/5 text-brand ring-brand/20',
  grey: 'bg-ink/5 text-ink/75 ring-ink/10',
} as const;

export function Pill({ tone, children }: { tone: keyof typeof PILL; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${PILL[tone]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

/** Explains that saving needs the database, shown on every form until MongoDB is connected. */
export function ReadOnlyNotice() {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <Icon name="database" className="mt-0.5 h-[18px] w-[18px]" />
      <p>
        <b>Read-only preview.</b> The catalogue still comes from the website&apos;s built-in data. Saving, adding and deleting are not available right now.
      </p>
    </div>
  );
}

export const btnDark =
  'inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-xs font-bold tracking-[0.08em] text-white uppercase transition-colors hover:bg-ink/85 disabled:cursor-not-allowed disabled:opacity-40';
export const btnLight =
  'inline-flex items-center gap-2 rounded-full border-[1.5px] border-ink bg-white px-4 py-2.5 text-xs font-bold tracking-[0.08em] text-ink uppercase transition-colors hover:border-brand hover:text-brand';
export const field =
  'mt-1.5 w-full rounded-xl border-[1.5px] border-ink bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand disabled:bg-ink/[0.03] disabled:text-ink/70';
export const fieldLabel = 'text-[11px] font-bold tracking-[0.14em] text-ink/75 uppercase';
