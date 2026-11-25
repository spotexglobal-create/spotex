# Spotex International — website

Next.js 15 (App Router) · Tailwind CSS 4 · next-intl (EN / DE / NO / IT / FR) · GSAP + Lenis. Deploys to Vercel.

```bash
npm install
npm run dev        # http://localhost:3000
npx tsc --noEmit   # type check
npm run lint
```

## Structure

```
src/
  app/[locale]/            pages (one folder per route; URLs are translated per language)
  components/
    layout/                Header, Footer, LanguageSwitcher, menu items
    home/hero/             Spotlight hero (server data → animated client stage)
    home/film/             Scroll film: scenes, timeline hook, export map, weave drawing
    catalog/               ProductCard, ProductGallery
    motion/SmoothScroll    Lenis smooth scrolling wired to GSAP ScrollTrigger
    ui/                    Small shared pieces (PageIntro, ContactActions)
  config/site.ts           Company details (address, phone, stats) — values marked TODO need confirming
  data/products.ts         Seed catalogue (70 products); moves to MongoDB on day 2
  i18n/                    Locales, translated pathnames, country → language, request config
  lib/catalog/             Catalogue types + data access + display text (the only layer that touches data)
  lib/seo.ts               Canonical + hreflang links
  messages/*.json          All visible text, one file per language (keys are type-checked)
  middleware.ts            Country-based language on the bare homepage, then next-intl routing
```

## Conventions

- Every page under `app/[locale]` calls `initLocale()` first and exports `generateMetadata` with `localeAlternates()`.
- Use `Link` / `useRouter` from `@/i18n/navigation`, never from `next/link`, so URLs stay localized.
- No hard-coded text in components: add a key to all four `messages/*.json` files.
- Catalogue records hold no prose. Specs are message keys (`Catalog.values`), so one record serves every language.
- Animated scenes keep their CSS in a plain `.css` file next to the component, scoped under one root class.
