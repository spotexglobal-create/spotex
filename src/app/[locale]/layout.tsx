import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { bebas, montserrat } from '@/app/fonts';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { SmoothScroll } from '@/components/motion/SmoothScroll';
import { routing } from '@/i18n/routing';
import { initLocale, type LocaleParams } from '@/i18n/server';
import { getCategories, getProducts } from '@/lib/catalog';
import { getCatalogText } from '@/lib/catalog/text';
import { SITE_URL } from '@/lib/seo';


export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = initLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'Meta' });
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t('homeTitle'), template: `%s · ${t('siteName')}` },
    description: t('homeDescription'),
    openGraph: { siteName: t('siteName'), locale, type: 'website' },
    // Google Search Console ownership check (<meta name="google-site-verification">)
    verification: { google: 'gor9grF8G0cMAHoR2YmtNvBR9GBPTFaZR9N7MahWdRE' },
  };
}

export default async function LocaleLayout({ children, params }: LocaleParams & { children: ReactNode }) {
  const locale = initLocale((await params).locale);
  // products mega menu: every category with a count and its first four products
  const [categories, products, text] = await Promise.all([getCategories(), getProducts(), getCatalogText()]);
  const menu = categories.map((c) => ({
    slug: c.slug,
    name: text.categoryName(c.slug),
    count: c.count,
    products: products
      .filter((p) => p.category === c.slug)
      .slice(0, 4)
      .map((p) => ({ slug: p.slug, code: p.code, name: text.productName(p), image: p.images[0] })),
  }));

  return (
    <html lang={locale} className={`${bebas.variable} ${montserrat.variable}`}>
      <body>
        <NextIntlClientProvider>
          <SmoothScroll>
            <Header categories={menu} />
            <main id="main">{children}</main>
            <Footer />
          </SmoothScroll>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
