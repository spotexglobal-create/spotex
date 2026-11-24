import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { bebas, montserrat } from '@/app/fonts';

export const metadata: Metadata = {
  title: { default: 'Admin · Spotex International', template: '%s · Spotex Admin' },
  robots: { index: false, follow: false },
};

/** The admin portal has its own <html> (English only, never indexed). */
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${bebas.variable} ${montserrat.variable}`}>
      <body className="bg-[#f4f4f5] text-ink">{children}</body>
    </html>
  );
}
