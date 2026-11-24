import { getTranslations } from 'next-intl/server';
import { getProducts } from '@/lib/catalog';
import { getCatalogText } from '@/lib/catalog/text';
import { HERO_ITEMS } from './hero-items';
import { SpotlightStage, type HeroSlide } from './SpotlightStage';

/** Server part of the hero: resolves products and texts, then hands plain data to the animated stage. */
export async function SpotlightHero() {
  const [t, common, catalog, products] = await Promise.all([
    getTranslations('Hero'),
    getTranslations('Common'),
    getCatalogText(),
    getProducts(),
  ]);

  const calloutText = t.raw('callouts') as Record<string, Record<string, { title: string; text: string }>>;

  const slides: HeroSlide[] = HERO_ITEMS.flatMap((item) => {
    const product = products.find((p) => p.slug === item.slug);
    if (!product) return [];
    return [
      {
        slug: product.slug,
        code: product.code,
        name: catalog.productName(product),
        category: product.category,
        image: product.images[0],
        spec: catalog.summary(product),
        callouts: item.callouts.map((c) => ({ ...c, ...calloutText[item.slug][c.key] })),
        ...(item.inner !== undefined ? { inner: item.inner } : {}),
      },
    ];
  });

  return (
    <SpotlightStage
      slides={slides}
      text={{
        introTop: t('introTop'),
        introFacts: t.raw('introFacts') as string[],
        eyebrow: t('eyebrow'),
        titleA: t('titleA'),
        titleB: t('titleB'),
        copy: t('copy'),
        viewCollection: common('viewCollection'),
        requestSample: common('requestSample'),
        scroll: common('scroll'),
      }}
    />
  );
}
