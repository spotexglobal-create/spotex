import type { CSSProperties, ReactNode } from 'react';
import type { SiteInfo, SocialKey } from '@/lib/site';

/** Each network in its own brand colour, with a white glyph (24×24, filled). */
const ICONS: Record<SocialKey, { label: string; bg: string; svg: ReactNode }> = {
  facebook: {
    label: 'Facebook',
    bg: '#1877F2',
    svg: <path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.6 1.6-1.6h1.7V4.4c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.3H7.3V14h2.8v8h3.4Z" />,
  },
  instagram: {
    label: 'Instagram',
    bg: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
    svg: (
      <path
        fillRule="evenodd"
        d="M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5Zm0 1.8A3.2 3.2 0 0 0 4.8 8v8A3.2 3.2 0 0 0 8 19.2h8a3.2 3.2 0 0 0 3.2-3.2V8A3.2 3.2 0 0 0 16 4.8H8Zm4 3a4.2 4.2 0 1 1 0 8.4 4.2 4.2 0 0 1 0-8.4Zm0 1.8a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8Zm4.6-2.7a1.05 1.05 0 1 1 0 2.1 1.05 1.05 0 0 1 0-2.1Z"
      />
    ),
  },
  linkedin: {
    label: 'LinkedIn',
    bg: '#0A66C2',
    svg: (
      <path d="M7.1 5.6a1.9 1.9 0 1 1-3.8 0 1.9 1.9 0 0 1 3.8 0ZM7 8.9H3.4V20H7V8.9Zm5.6 0H9.1V20h3.5v-5.8c0-3.2 4.2-3.5 4.2 0V20h3.5v-7c0-5.5-6.2-5.3-7.7-2.6V8.9Z" />
    ),
  },
  youtube: {
    label: 'YouTube',
    bg: '#FF0000',
    svg: <path d="M10 15.5v-7l6 3.5-6 3.5Z" />,
  },
  tiktok: {
    label: 'TikTok',
    bg: '#010101',
    svg: <path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.2v12.4a2.6 2.6 0 1 1-1.8-2.5V9.7a5.8 5.8 0 1 0 5 5.7V9.1a7.4 7.4 0 0 0 4.3 1.4V7.3a4.3 4.3 0 0 1-3.2-1.5Z" />,
  },
};

/**
 * App-icon style buttons for every social profile (admin → Settings, or the defaults): a rounded square
 * in the network's brand colour with its white logo, lifting on hover. Renders nothing when none are set.
 * `light` is for white backgrounds.
 */
export function SocialLinks({ social, className = '', light = false }: { social: SiteInfo['social']; className?: string; light?: boolean }) {
  const links = (Object.keys(ICONS) as SocialKey[]).filter((k) => social[k]);
  if (!links.length) return null;
  return (
    <ul className={`flex flex-wrap gap-3 ${className}`}>
      {links.map((k) => (
        <li key={k}>
          <a
            href={social[k]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={ICONS[k].label}
            title={ICONS[k].label}
            style={{ background: ICONS[k].bg } as CSSProperties}
            className={`grid h-11 w-11 place-items-center rounded-[13px] text-white shadow-[0_6px_16px_rgba(0,0,0,.25)] transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_10px_22px_rgba(0,0,0,.35)] ${
              light ? '' : 'ring-1 ring-white/10'
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-[23px] w-[23px] fill-current">
              {ICONS[k].svg}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
