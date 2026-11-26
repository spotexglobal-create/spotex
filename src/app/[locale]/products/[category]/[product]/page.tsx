import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ProductCard } from '@/components/catalog/ProductCard';
import { ProductGallery } from '@/components/catalog/ProductGallery';
import { SITE, whatsappLink } from '@/config/site';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { initLocale, type LocaleParams } from '@/i18n/server';
import { getProduct, getProducts, getRelatedProducts, isCategorySlug } from '@/lib/catalog';
import { getCatalogText } from '@/lib/catalog/text';
import { localeAlternates } from '@/lib/seo';
import { getSite } from '@/lib/site';

type Props = LocaleParams<{ category: string; product: string }>;

export async function generateStaticParams() {
  const products = await getProducts();
  return routing.locales.flatMap((locale) => products.map((p) => ({ locale, category: p.category, product: p.slug })));
}

async function load(category: string, slug: string) {
  if (!isCategorySlug(category)) return undefined;
  return getProduct(category, slug);
}

export async function generateMetadata({ params }: Props) {
  const { locale: raw, category, product: slug } = await params;
  const locale = initLocale(raw);
  const product = await load(category, slug);
  if (!product) return {};
  const [t, text] = await Promise.all([getTranslations({ locale, namespace: 'ProductPage' }), getCatalogText()]);
  const name = text.productName(product);
  return {
    title: `${name} ${product.code}`,
    description: t('metaDescription', { name, code: product.code, specs: text.summary(product) }),
    alternates: localeAlternates(locale, {
      pathname: '/products/[category]/[product]',
      params: { category: product.category, product: product.slug },
    }),
    openGraph: { images: [product.images[0]] },
  };
}

const LABEL = 'text-[11px] font-bold tracking-[0.2em] text-ink/55 uppercase';

export default async function ProductPage({ params }: Props) {
  const { locale, category, product: slug } = await params;
  initLocale(locale);
  const site = await getSite();
  const product = await load(category, slug);
  if (!product) notFound();

  const [t, nav, common, film, text, related] = await Promise.all([
    getTranslations('ProductPage'),
    getTranslations('Nav'),
    getTranslations('Common'),
    getTranslations('Film'),
    getCatalogText(),
    getRelatedProducts(product, 5),
  ]);
  const name = text.productName(product);
  const customList = t.raw('customList') as string[];
  const highlights = t.raw('highlights') as { title: string; text: string }[];
  const steps = film.raw('custom.steps') as string[];
  const categoryName = text.categoryName(product.category);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${name} ${product.code}`,
    sku: product.code,
    image: product.images,
    description: text.summary(product),
    brand: { '@type': 'Brand', name: SITE.name },
    manufacturer: { '@type': 'Organization', name: SITE.name },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="container-page pt-24 pb-16 md:pt-[104px]">
        {/* breadcrumbs */}
        <nav aria-label="Breadcrumb" className="text-[11px] font-bold tracking-[0.16em] uppercase">
          <ol className="flex flex-wrap items-center gap-2 text-ink/50">
            <li>
              <Link href="/" className="hover:text-brand">
                {nav('home')}
              </Link>
            </li>
            <li aria-hidden className="text-brand">/</li>
            <li>
              <Link href="/products" className="hover:text-brand">
                {nav('products')}
              </Link>
            </li>
            <li aria-hidden className="text-brand">/</li>
            <li>
              <Link href={{ pathname: '/products/[category]', params: { category: product.category } }} className="hover:text-brand">
                {categoryName}
              </Link>
            </li>
            <li aria-hidden className="text-brand">/</li>
            <li className="text-ink" aria-current="page">
              {product.code}
            </li>
          </ol>
        </nav>

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14">
          {/* photos stay in view while the details scroll */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <ProductGallery images={product.images} alt={`${name} ${product.code}`} zoomHint={t('zoomHint')} />
          </div>

          <div className="flex flex-col">
            <h1 className="display text-[clamp(40px,4.6vw,68px)] text-ink">{name}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-ink px-3.5 py-1.5 text-[11px] font-extrabold tracking-[0.14em] text-white">{product.code}</span>
              <span className="rounded-full border-[1.5px] border-brand px-3.5 py-1.5 text-[11px] font-bold tracking-[0.12em] text-brand uppercase">
                {t('madeToOrder')}
              </span>
              <span className="rounded-full border-[1.5px] border-ink/25 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.12em] text-ink uppercase">
                {t('sampleAvailable')}
              </span>
            </div>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed">{text.categoryIntro(product.category)}</p>

            {/* actions: quote first, sample second, WhatsApp as a round icon button */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href={{ pathname: '/contact', query: { product: product.code } }} className="btn">
                {common('requestQuote')}
              </Link>
              <Link href={{ pathname: '/contact', query: { product: product.code, sample: '1' } }} className="btn btn-ghost">
                {common('requestSample')}
              </Link>
              <a
                href={whatsappLink(t('whatsappText', { code: product.code, name }), site.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn border-[#25d366] bg-[#25d366] text-white hover:border-[#1ebe5b] hover:bg-[#1ebe5b]"
              >
                <svg viewBox="0 0 24 24" aria-hidden className="h-[18px] w-[18px] fill-current">
                  <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Zm4.6 12.6c-.2.6-1.1 1.1-1.6 1.2-.4 0-.9.1-2.9-.7-2.4-1-4-3.4-4.1-3.6-.1-.2-1-1.3-1-2.5s.6-1.8.9-2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.3 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.8.9c.3.1.4.2.5.3.1.2.1.6-.1 1.2Z" />
                </svg>
                {common('whatsapp')}
              </a>
            </div>
            <p className="mt-3 flex items-center gap-2 text-[12.5px] text-ink/85">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand" />
              {t('moq')}
            </p>

            {/* product details: one clean bordered sheet */}
            <div className="mt-8 overflow-hidden rounded-[22px] border-[1.5px] border-ink/20">
              <p className="flex items-center justify-between border-b border-ink/10 bg-soft px-5 py-3">
                <span className="text-[11px] font-bold tracking-[0.2em] text-ink uppercase">{t('specs')}</span>
                <span className="text-[11px] font-extrabold tracking-[0.14em] text-brand">{product.code}</span>
              </p>
              <dl className="divide-y divide-ink/10 px-5">
                {product.specs.map((spec) => (
                  <div key={spec.label} className="grid grid-cols-[minmax(0,104px)_minmax(0,1fr)] gap-3 py-3 sm:grid-cols-[130px_minmax(0,1fr)] sm:gap-4 text-sm">
                    <dt className="font-medium text-ink/80">{text.specLabel(spec)}</dt>
                    <dd className="font-semibold text-ink">{text.specValue(spec)}</dd>
                  </div>
                ))}
                <div className="grid grid-cols-[minmax(0,104px)_minmax(0,1fr)] gap-3 py-3 sm:grid-cols-[130px_minmax(0,1fr)] sm:gap-4 text-sm">
                  <dt className="font-medium text-ink/80">{t('custom')}</dt>
                  <dd>
                    <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                      {customList.map((item) => (
                        <li key={item} className="flex items-center gap-2 font-semibold text-ink">
                          <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5 flex-none fill-none stroke-brand stroke-[2.2]">
                            <path d="m3 8.5 3 3 7-7" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              </dl>
              {/* why order from us */}
              <ul className="grid grid-cols-1 border-t border-ink/10 bg-soft sm:grid-cols-3">
                {highlights.map((h, i) => (
                  <li key={h.title} className={`flex items-start gap-3 px-5 py-4 ${i > 0 ? 'border-t border-ink/10 sm:border-t-0 sm:border-l' : ''}`}>
                    <span aria-hidden className="grid h-8 w-8 flex-none place-items-center rounded-full bg-white text-brand ring-1 ring-ink/10">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
                        {i === 0 && <path d="M3 21V10l6 3V10l6 3V6l6 3v12H3Zm4-4h2m4 0h2" />}
                        {i === 1 && <path d="M12 3l2.6 5.3 5.9.9-4.3 4.2 1 5.8L12 16.5 6.8 19.2l1-5.8L3.5 9.2l5.9-.9L12 3Z" />}
                        {i === 2 && <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Z" />}
                      </svg>
                    </span>
                    <span>
                      <span className="block text-[13px] font-bold text-ink">{h.title}</span>
                      <span className="mt-0.5 block text-[12px] leading-snug text-ink/80">{h.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ordering steps: a light timeline instead of heavy blocks */}
            <h2 className={`mt-8 ${LABEL}`}>{t('orderTitle')}</h2>
            <ol className="relative mt-4 grid grid-cols-2 gap-y-5 sm:grid-cols-4">
              <span aria-hidden className="absolute top-[13px] right-[12%] left-[12%] hidden h-[2px] bg-brand sm:block" />
              {steps.map((step, i) => (
                <li key={step} className="relative flex flex-col items-center px-2 text-center">
                  <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-brand bg-white font-[family-name:var(--font-display)] text-[15px] text-brand">
                    {i + 1}
                  </span>
                  <span className="mt-2 text-[12.5px] font-semibold leading-snug text-ink">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="container-page pb-24">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <h2 className="display text-4xl text-ink">{t('related')}</h2>
            <Link href={{ pathname: '/products/[category]', params: { category: product.category } }} className="text-xs font-bold tracking-[0.14em] text-brand uppercase hover:underline">
              {t('viewRange', { name: categoryName })} →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-5">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} text={text} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
