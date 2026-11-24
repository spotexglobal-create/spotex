import { getProducts } from '@/lib/catalog';
import { getCatalogText } from '@/lib/catalog/text';
import { CATEGORY_SLUGS, type Product } from '@/lib/catalog/types';
import type { QuickViewProduct } from '@/components/catalog/ProductQuickView';
import { buildExportMap } from './export-map';
import { FilmStage, type FilmProduct } from './FilmStage';
import { getSite } from '@/lib/site';

/** Products used in each scene, by slug. Line-up: one product per discipline (index into Film.uniforms.disciplines). */
const LINEUP = [
  { discipline: 1, slug: 'si-ju-1003' },
  { discipline: 2, slug: 'k-104-sti-1' },
  { discipline: 0, slug: 'si-jju-1001', main: true },
  { discipline: 3, slug: 'tk-sti-01' },
  { discipline: 4, slug: 'si-sb-1001' },
];
const MAIN = 'si-jju-1001';
/** How many products turn on the collection ring; taken one per category in turn, so every category is in it. */
const RING_SIZE = 12;
const BELTS = ['jjb-101-sti-01', 'jjb103-sti-01', 'jjb-102-sti-01', 'j-101-sti-1'];

/** Server part of the home film: picks the products and builds the map, then renders the animated stage. */
export async function HomeFilm() {
  const [products, text] = await Promise.all([getProducts(), getCatalogText()]);
  const site = await getSite();
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const toFilm = (p: Product): FilmProduct => ({
    slug: p.slug,
    code: p.code,
    name: text.productName(p),
    category: p.category,
    image: p.images[0],
  });
  const toQuickView = (p: Product): QuickViewProduct => ({
    slug: p.slug,
    code: p.code,
    name: text.productName(p),
    category: p.category,
    categoryName: text.categoryName(p.category),
    images: p.images,
    specs: p.specs.map((spec) => ({ label: text.specLabel(spec), value: text.specValue(spec) })),
  });
  // round-robin over the categories: 1st of each, then 2nd of each … until the ring is full
  const byCategory = CATEGORY_SLUGS.map((c) => products.filter((p) => p.category === c));
  const ring: Product[] = [];
  for (let round = 0; ring.length < RING_SIZE && byCategory.some((list) => list.length > round); round++)
    for (const list of byCategory) if (list[round] && ring.length < RING_SIZE) ring.push(list[round]);
  const pick = (slug: string) => {
    const p = bySlug.get(slug);
    if (!p) throw new Error(`Home film: product "${slug}" is missing from the catalogue`);
    return toFilm(p);
  };
  return (
    <FilmStage
      data={{
        actorImage: pick(MAIN).image,
        lineup: LINEUP.map(({ discipline, slug, main }) => {
          const p = pick(slug);
          return { discipline, category: p.category, image: p.image, main };
        }),
        ring: ring.map(toQuickView),
        belts: BELTS.map(pick),
        map: buildExportMap(),
        stats: { staff: site.stats.staff, clients: site.stats.clients, since: site.foundedYear },
      }}
    />
  );
}
