import type { ReactNode } from 'react';
import type { SiteInfo, SocialKey } from '@/lib/site';

/** Line icons (24×24, stroke) for the footer's social links. */
const ICONS: Record<SocialKey, { label: string; svg: ReactNode }> = {
  facebook: { label: 'Facebook', svg: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /> },
  instagram: {
    label: 'Instagram',
    svg: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <path d="M17.5 6.5h.01" />
      </>
    ),
  },
  linkedin: {
    label: 'LinkedIn',
    svg: (
      <>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
        <path d="M2 9h4v12H2z" />
        <circle cx="4" cy="4" r="2" />
      </>
    ),
  },
  youtube: {
    label: 'YouTube',
    svg: (
      <>
        <path d="M2.5 17a24 24 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.6 49.6 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24 24 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.6 49.6 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
        <path d="m10 15 5-3-5-3z" />
      </>
    ),
  },
  tiktok: { label: 'TikTok', svg: <path d="M9 12a4 4 0 1 0 4 4V3c.6 2.6 2.6 4.6 5 5" /> },
};

/** Round icon buttons for every social profile filled in admin → Settings. Renders nothing when none are set. */
export function SocialLinks({ social, className = '' }: { social: SiteInfo['social']; className?: string }) {
  const links = (Object.keys(ICONS) as SocialKey[]).filter((k) => social[k]);
  if (!links.length) return null;
  return (
    <ul className={`flex flex-wrap gap-2.5 ${className}`}>
      {links.map((k) => (
        <li key={k}>
          <a
            href={social[k]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={ICONS[k].label}
            title={ICONS[k].label}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white/85 transition-colors hover:border-brand hover:bg-brand hover:text-white"
          >
            <svg viewBox="0 0 24 24" aria-hidden className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.8]" strokeLinecap="round" strokeLinejoin="round">
              {ICONS[k].svg}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
