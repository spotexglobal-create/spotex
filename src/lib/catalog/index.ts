import { unstable_cache } from 'next/cache';
import { PRODUCTS } from '@/data/products';
import { connectDb, dbConfigured } from '@/lib/db/connect';
import { CategoryModel, ProductModel } from '@/lib/db/models';
import {
  CATEGORY_LOCALES,
  CATEGORY_SLUGS,
  type Category,
  type CategoryRecord,
  type CategorySlug,
  type LocalizedText,
  type Product,
  type Spec,
} from './types';

/**
 * Catalogue data access. Pages only talk to these functions.
 * With MONGODB_URI set the catalogue comes from MongoDB (cached, refreshed when the admin saves:
 * revalidateTag(CATALOG_TAG)); without it, from the built-in seed in src/data/products.ts.
 */

export const CATALOG_TAG = 'catalog';

/** Plain object from a MongoDB record (no _id, dates or empty optional fields), safe to pass to client components. */
export function toProduct(doc: Record<string, unknown>): Product {
  const d = doc as unknown as Product;
  return {
    slug: d.slug,
    code: d.code,
    category: d.category,
    type: d.type,
    ...(d.line ? { line: d.line } : {}),
    specs: (d.specs ?? []).map((s: Spec) => ({
      label: s.label,
      ...(s.value ? { value: s.value } : {}),
      ...(s.amount != null ? { amount: s.amount } : {}),
      ...(s.unit ? { unit: s.unit } : {}),
    })),
    images: [...(d.images ?? [])],
    featured: Boolean(d.featured),
    visible: d.visible !== false,
  };
}

const loadFromDb = unstable_cache(
  async (): Promise<Product[]> => {
    await connectDb();
    const docs = await ProductModel.find().sort({ order: 1, code: 1 }).lean();
    return docs.map((d) => toProduct(d));
  },
  ['catalog-products-v2'],
  { tags: [CATALOG_TAG], revalidate: 3600 },
);

/** Every product, hidden ones included (admin). */
export async function getAllProducts(): Promise<Product[]> {
  return dbConfigured() ? loadFromDb() : PRODUCTS;
}

/** Category record when the database has none yet: texts from the message files, built-in order. */
const defaultCategory = (slug: CategorySlug): CategoryRecord => ({
  slug,
  name: {},
  intro: {},
  cover: '',
  visible: true,
  order: CATEGORY_SLUGS.indexOf(slug) * 10,
});

function toCategoryRecord(doc: Record<string, unknown>): CategoryRecord {
  const d = doc as unknown as Partial<CategoryRecord> & { slug: CategorySlug };
  const pick = (v?: LocalizedText) => {
    const out: LocalizedText = {};
    for (const l of CATEGORY_LOCALES) if (v?.[l]?.trim()) out[l] = v[l]!.trim();
    return out;
  };
  return {
    slug: d.slug,
    name: pick(d.name),
    intro: pick(d.intro),
    cover: d.cover ?? '',
    visible: d.visible !== false,
    order: typeof d.order === 'number' ? d.order : defaultCategory(d.slug).order,
  };
}

const loadCategoriesFromDb = unstable_cache(
  async (): Promise<CategoryRecord[]> => {
    await connectDb();
    const docs = await CategoryModel.find().lean();
    return docs.map((d) => toCategoryRecord(d));
  },
  ['catalog-categories-v2'],
  { tags: [CATALOG_TAG], revalidate: 3600 },
);

/** All six categories (hidden ones too) with their stored details, in menu order. */
export async function getCategoryRecords(): Promise<CategoryRecord[]> {
  const stored = dbConfigured() ? await loadCategoriesFromDb() : [];
  return CATEGORY_SLUGS.map((slug) => stored.find((c) => c.slug === slug) ?? defaultCategory(slug)).sort(
    (a, b) => a.order - b.order || CATEGORY_SLUGS.indexOf(a.slug) - CATEGORY_SLUGS.indexOf(b.slug),
  );
}

/** Products shown on the website: visible, and in a category that is not hidden. */
async function live() {
  const [products, records] = await Promise.all([getAllProducts(), getCategoryRecords()]);
  const hidden = new Set(records.filter((c) => !c.visible).map((c) => c.slug));
  return products.filter((p) => p.visible !== false && !hidden.has(p.category));
}

export function isCategorySlug(value: string): value is CategorySlug {
  return (CATEGORY_SLUGS as readonly string[]).includes(value);
}

/** Cover photo: the uploaded one, else the first featured (or first) product photo. */
const coverOf = (record: CategoryRecord, items: Product[]) =>
  record.cover || ((items.find((p) => p.featured) ?? items[0])?.images[0] ?? '');

/** Categories on the website: not hidden and with at least one product, in menu order. */
export async function getCategories(): Promise<(Category & { count: number })[]> {
  const [products, records] = await Promise.all([live(), getCategoryRecords()]);
  return records
    .filter((r) => r.visible)
    .map((r) => {
      const items = products.filter((p) => p.category === r.slug);
      return { slug: r.slug, cover: coverOf(r, items), count: items.length };
    })
    .filter((c) => c.count > 0);
}

/** Every category for the admin: stored details, product counts (all products) and the cover in use. */
export async function getAdminCategories(): Promise<(CategoryRecord & { count: number; liveCount: number; coverInUse: string })[]> {
  const [products, records] = await Promise.all([getAllProducts(), getCategoryRecords()]);
  return records.map((r) => {
    const items = products.filter((p) => p.category === r.slug);
    const liveItems = items.filter((p) => p.visible !== false);
    return { ...r, count: items.length, liveCount: liveItems.length, coverInUse: coverOf(r, liveItems.length ? liveItems : items) };
  });
}

/** Products shown on the website. */
export async function getProducts(category?: CategorySlug): Promise<Product[]> {
  const products = await live();
  return category ? products.filter((p) => p.category === category) : products;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return (await live()).filter((p) => p.featured);
}

export async function getProduct(category: CategorySlug, slug: string): Promise<Product | undefined> {
  return (await live()).find((p) => p.category === category && p.slug === slug);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  return (await live()).filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, limit);
}

export type { Category, CategoryRecord, CategorySlug, Product, ProductType, Spec } from './types';
