import type { Locale } from './routing';

/** Countries that get their own language. Every other country sees English. */
const COUNTRY_LOCALE: Record<string, Locale> = {
  DE: 'de',
  AT: 'de',
  LI: 'de',
  NO: 'no',
  SJ: 'no',
  IT: 'it',
  SM: 'it',
  VA: 'it',
  FR: 'fr',
  MC: 'fr',
  LU: 'fr',
};

/**
 * Picks the language for a first visit from the visitor's country (set by the host, e.g. Vercel).
 * Switzerland is multilingual, so there the browser language decides.
 * Returns null when the country is unknown, so the browser language is used instead.
 */
export function localeForCountry(country: string | null, acceptLanguage: string): Locale | null {
  if (!country) return null;
  const code = country.toUpperCase();
  if (code === 'CH') {
    const primary = acceptLanguage.split(',')[0]?.trim().slice(0, 2).toLowerCase();
    if (primary === 'de') return 'de';
    if (primary === 'it') return 'it';
    if (primary === 'fr') return 'fr';
    return 'en';
  }
  return COUNTRY_LOCALE[code] ?? 'en';
}
