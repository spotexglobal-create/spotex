'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useLenis } from '@/components/motion/SmoothScroll';
import { SITE } from '@/config/site';
import { Link, usePathname } from '@/i18n/navigation';
import { FactoryMenu } from './FactoryMenu';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ProductsMenu, type MenuCategory } from './ProductsMenu';
import { NAV_ITEMS } from './nav-items';

export function Header({ categories }: { categories: MenuCategory[] }) {
  const t = useTranslations();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close the mobile menu after navigating
  useEffect(() => setMenuOpen(false), [pathname]);

  // while the mobile menu is open the page behind it stays still; only the menu scrolls
  const lenis = useLenis();
  useEffect(() => {
    if (!menuOpen) return;
    lenis?.stop();
    const root = document.documentElement;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = '';
      lenis?.start();
    };
  }, [menuOpen, lenis]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-300 ${
        menuOpen ? 'bg-white' : scrolled && pathname !== '/' ? 'bg-white/95 shadow-[0_1px_0_var(--color-line)] backdrop-blur' : ''
      }`}
    >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded focus:bg-white focus:px-3 focus:py-2">
        {t('Nav.skip')}
      </a>
      <div className="container-page flex h-[72px] items-center justify-between gap-4">
        <Link href="/" className="inline-flex shrink-0 rounded-[10px] bg-ink px-2.5 py-1.5 min-[380px]:px-3" aria-label={SITE.name}>
          <Image src={SITE.logo} alt={SITE.name} width={110} height={30} className="h-[26px] w-auto min-[380px]:h-[30px]" priority />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-6 rounded-full border-[1.5px] border-ink/20 bg-white/95 px-6 py-3 text-xs font-bold tracking-[0.12em] uppercase">
            {NAV_ITEMS.map((item) =>
              item.href === '/products' ? (
                <ProductsMenu key={item.href} label={t(`Nav.${item.label}`)} active={isActive(item.href)} categories={categories} />
              ) : item.href === '/factory' ? (
                <FactoryMenu key={item.href} label={t(`Nav.${item.label}`)} active={isActive(item.href)} />
              ) : (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`transition-colors hover:text-brand ${isActive(item.href) ? 'text-brand' : 'text-ink/80'}`}
                  >
                    {t(`Nav.${item.label}`)}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link href="/contact" className="btn hidden sm:inline-flex">
            {t('Common.requestQuote')}
          </Link>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? t('Nav.close') : t('Nav.menu')}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          // its own scroll area (data-lenis-prevent: the smooth scroller leaves it alone)
          data-lenis-prevent
          className="container-page max-h-[calc(100dvh-72px)] overflow-y-auto overscroll-contain border-t border-line bg-white pb-8 lg:hidden"
        >
          <ul className="flex flex-col">
            {NAV_ITEMS.map((item) => (
              <li key={item.href} className="border-b border-line">
                <Link href={item.href} className={`display block py-4 text-3xl ${isActive(item.href) ? 'text-brand' : ''}`}>
                  {t(`Nav.${item.label}`)}
                </Link>
                {item.href === '/products' && (
                  <ul className="-mt-1 grid grid-cols-1 gap-x-4 pb-4 min-[420px]:grid-cols-2">
                    {categories.map((c) => (
                      <li key={c.slug}>
                        <Link
                          href={{ pathname: '/products/[category]', params: { category: c.slug } }}
                          className="flex items-center justify-between gap-3 py-2 text-sm font-semibold text-ink/75"
                        >
                          {c.name}
                          <span className="text-xs text-brand">{c.count}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          <Link href="/contact" className="btn mt-5 w-full">
            {t('Common.requestQuote')}
          </Link>
        </nav>
      )}
    </header>
  );
}
