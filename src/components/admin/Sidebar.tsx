'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { logout } from '@/app/admin/actions';
import { SITE } from '@/config/site';
import { Icon, type ICONS } from './ui';

const NAV: { href: string; label: string; icon: keyof typeof ICONS }[] = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { href: '/admin/products', label: 'Products', icon: 'products' },
  { href: '/admin/categories', label: 'Categories', icon: 'categories' },
  { href: '/admin/quotes', label: 'Quote requests', icon: 'quotes' },
  { href: '/admin/messages', label: 'Messages', icon: 'chat' },
  { href: '/admin/blog', label: 'Blog', icon: 'blog' },
  { href: '/admin/settings', label: 'Settings', icon: 'settings' },
];

/** Dark side navigation (a drawer on small screens) with the account and sign-out at the bottom. */
export function Sidebar({ email, counts }: { email: string; counts: Record<string, number> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === '/admin' ? pathname === href : pathname.startsWith(href));

  return (
    <>
      {/* phone top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-ink px-4 py-3 lg:hidden">
        <Image src={SITE.logo} alt={SITE.name} width={110} height={30} className="h-7 w-auto rounded" />
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Menu" className="rounded-lg p-2 text-white">
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
            <path d={open ? 'M6 6l12 12M18 6 6 18' : 'M4 7h16M4 12h16M4 17h16'} />
          </svg>
        </button>
      </div>

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col bg-ink text-white transition-transform lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-6 pt-6 pb-8">
          <Image src={SITE.logo} alt={SITE.name} width={140} height={38} className="h-9 w-auto rounded-md" />
          <p className="mt-3 text-[10px] font-bold tracking-[0.24em] text-white/65 uppercase">Admin portal</p>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                active(item.href) ? 'bg-white text-ink' : 'text-white/65 hover:bg-white/[0.07] hover:text-white'
              }`}
            >
              <span className={active(item.href) ? 'text-brand' : ''}>
                <Icon name={item.icon} />
              </span>
              <span className="flex-1">{item.label}</span>
              {counts[item.href] !== undefined && (
                <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${active(item.href) ? 'bg-ink/5 text-ink/75' : 'bg-white/10 text-white/80'}`}>
                  {counts[item.href]}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="space-y-1 border-t border-white/10 p-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white/65 hover:bg-white/[0.07] hover:text-white"
          >
            <Icon name="external" /> View website
          </a>
          <div className="flex items-center gap-3 rounded-xl px-3.5 py-3">
            <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-brand text-xs font-bold uppercase">{email[0]}</span>
            <span className="min-w-0 flex-1 truncate text-xs text-white/70">{email}</span>
            <form action={logout}>
              <button type="submit" title="Sign out" aria-label="Sign out" className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white">
                <Icon name="logout" className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>
      {open && <button type="button" aria-label="Close menu" className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}
    </>
  );
}
