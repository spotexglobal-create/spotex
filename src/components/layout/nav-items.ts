import type { AppPathname } from '@/i18n/routing';

/** Main menu. Labels are keys in the "Nav" messages namespace. */
export const NAV_ITEMS = [
  { href: '/', label: 'home' },
  { href: '/products', label: 'products' },
  { href: '/private-label', label: 'privateLabel' },
  { href: '/factory', label: 'factory' },
  { href: '/about', label: 'about' },
  { href: '/blog', label: 'blog' },
  { href: '/contact', label: 'contact' },
] as const satisfies readonly { href: AppPathname; label: string }[];
