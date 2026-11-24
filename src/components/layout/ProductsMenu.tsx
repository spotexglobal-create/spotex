'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import type { CategorySlug } from '@/lib/catalog/types';

/** Catalogue data for the menu, already translated on the server. */
export interface MenuCategory {
  slug: CategorySlug;
  name: string;
  count: number;
  products: { slug: string; code: string; name: string; image: string }[];
}

/**
 * "Products" item of the main menu with a mega menu: categories on the left; pointing at one
 * shows a few of its products on the right. Opens on hover or keyboard focus, closes on Esc,
 * when the pointer leaves (after a short grace period) and after navigating.
 */
export function ProductsMenu({ label, active, categories }: { label: string; active: boolean; categories: MenuCategory[] }) {
  const t = useTranslations('Nav');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

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

  const cat = categories[current];

  return (
    <li onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && hide()}>
      <Link
        href="/products"
        aria-expanded={open}
        aria-haspopup="true"
        className={`inline-flex items-center gap-1.5 transition-colors hover:text-brand ${active || open ? 'text-brand' : 'text-ink/80'}`}
      >
        {label}
        <svg aria-hidden viewBox="0 0 24 24" className={`h-3 w-3 fill-none stroke-current stroke-[3] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </Link>

      {open && cat && (
        // positioned against the header bar, centred under the menu
        <div className="absolute inset-x-0 top-full z-50 pt-3 normal-case tracking-normal" onMouseEnter={show}>
          <div className="container-page">
            <div className="mx-auto grid max-w-[1120px] grid-cols-[270px_1fr] overflow-hidden rounded-[24px] border-[1.5px] border-ink/15 bg-white shadow-[0_30px_70px_rgba(0,0,0,.14)] animate-[menu-in_.22s_ease-out]">
              {/* categories */}
              <ul className="m-3 mr-0 rounded-2xl border-[1.5px] border-ink bg-soft p-2">
                {categories.map((c, i) => (
                  <li key={c.slug}>
                    <Link
                      href={{ pathname: '/products/[category]', params: { category: c.slug } }}
                      onMouseEnter={() => setCurrent(i)}
                      onFocus={() => setCurrent(i)}
                      className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-[13.5px] font-bold transition-colors ${
                        i === current ? 'bg-brand text-white' : 'text-ink hover:bg-white'
                      }`}
                    >
                      {c.name}
                      <span
                        className={`grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10.5px] font-extrabold ${
                          i === current ? 'bg-white text-brand' : 'bg-ink/10 text-ink'
                        }`}
                      >
                        {c.count}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              {/* products of the category under the pointer */}
              <div className="m-3 flex flex-col rounded-2xl border-[1.5px] border-ink p-4">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="display text-3xl text-ink">{cat.name}</p>
                  <Link
                    href={{ pathname: '/products/[category]', params: { category: cat.slug } }}
                    className="text-[11px] font-bold tracking-[0.14em] text-brand uppercase hover:underline"
                  >
                    {t('viewAll', { count: cat.count })} →
                  </Link>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {cat.products.map((p) => (
                    <Link
                      key={p.slug}
                      href={{ pathname: '/products/[category]/[product]', params: { category: cat.slug, product: p.slug } }}
                      className="group overflow-hidden rounded-2xl border-[1.5px] border-ink transition-colors hover:border-brand"
                    >
                      <span className="relative block aspect-square bg-soft">
                        <Image
                          src={p.image}
                          alt={`${p.name} ${p.code}`}
                          fill
                          sizes="180px"
                          className="photo-multiply object-cover transition-transform duration-300 group-hover:scale-[1.05]"
                        />
                      </span>
                      <span className="block px-3 py-2.5">
                        <span className="block text-[10px] font-extrabold tracking-[0.14em] text-brand">{p.code}</span>
                        <span className="mt-0.5 block truncate text-[12.5px] font-semibold text-ink">{p.name}</span>
                      </span>
                    </Link>
                  ))}
                </div>
                <Link
                  href="/products"
                  className="mt-4 self-start text-[11px] font-bold tracking-[0.14em] text-ink/60 uppercase transition-colors hover:text-brand"
                >
                  {t('allProducts')} →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
