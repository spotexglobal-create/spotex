'use client';

import { useEffect } from 'react';
import { whatsappLink } from '@/config/site';
import './globals.css';

/**
 * Last-resort page for when the whole site frame (header, footer, language) fails to load. It replaces
 * the root layout, so it brings its own <html> and cannot use translations: English, kept short.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="container-page flex min-h-screen flex-col items-start justify-center py-16" style={{ fontFamily: 'system-ui, sans-serif' }}>
          <p className="eyebrow">Spotex International</p>
          <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-ink uppercase">Something went wrong</h1>
          <p className="mt-3 max-w-lg text-[15.5px] leading-relaxed">The website could not load. Please try again in a moment, or message us on WhatsApp.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={reset} className="btn">
              Try again
            </button>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              WhatsApp
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
