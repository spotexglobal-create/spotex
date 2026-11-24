import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'de', 'no', 'it', 'fr'],
  defaultLocale: 'en',
  localePrefix: 'always',
  // Every page gets a URL in the visitor's own language (better for SEO and for trust).
  pathnames: {
    '/': '/',
    '/products': { en: '/products', de: '/produkte', no: '/produkter', it: '/prodotti', fr: '/produits' },
    '/products/[category]': {
      en: '/products/[category]',
      de: '/produkte/[category]',
      no: '/produkter/[category]',
      it: '/prodotti/[category]',
      fr: '/produits/[category]',
    },
    '/products/[category]/[product]': {
      en: '/products/[category]/[product]',
      de: '/produkte/[category]/[product]',
      no: '/produkter/[category]/[product]',
      it: '/prodotti/[category]/[product]',
      fr: '/produits/[category]/[product]',
    },
    '/private-label': { en: '/private-label', de: '/eigenmarke', no: '/egen-merkevare', it: '/marchio-privato', fr: '/marque-blanche' },
    '/factory': { en: '/factory', de: '/fabrik', no: '/fabrikk', it: '/fabbrica', fr: '/usine' },
    '/factory/[department]': {
      en: '/factory/[department]',
      de: '/fabrik/[department]',
      no: '/fabrikk/[department]',
      it: '/fabbrica/[department]',
      fr: '/usine/[department]',
    },
    '/about': { en: '/about', de: '/ueber-uns', no: '/om-oss', it: '/chi-siamo', fr: '/a-propos' },
    '/blog': '/blog',
    '/blog/[slug]': '/blog/[slug]',
    '/contact': { en: '/contact', de: '/kontakt', no: '/kontakt', it: '/contatti', fr: '/contact' },
  },
});

export type Locale = (typeof routing.locales)[number];
export type AppPathname = keyof typeof routing.pathnames;
