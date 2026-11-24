import { unstable_cache } from 'next/cache';
import { PRODUCTS } from '@/data/products';
import { connectDb, dbConfigured } from '@/lib/db/connect';
import { ProductModel } from '@/lib/db/models';
import { CATEGORY_SLUGS, type Category, type CategorySlug, type Product, type Spec } from './types';

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
  ['catalog-products'],
  { tags: [CATALOG_TAG], revalidate: 3600 },
);

/** Every product, hidden ones included (admin). */
export async function getAllProducts(): Promise<Product[]> {
  return dbConfigured() ? loadFromDb() : PRODUCTS;
}

async function live() {
  return (await getAllProducts()).filter((p) => p.visible !== false);
}

export function isCategorySlug(value: string): value is CategorySlug {
  return (CATEGORY_SLUGS as readonly string[]).includes(value);
}

/** Categories that have products, in menu order (an empty one, e.g. a new range, stays hidden). */
export async function getCategories(): Promise<(Category & { count: number })[]> {
  const products = await live();
  return CATEGORY_SLUGS.map((slug) => {
    const items = products.filter((p) => p.category === slug);
    const cover = (items.find((p) => p.featured) ?? items[0])?.images[0] ?? '';
    return { slug, cover, count: items.length };
  }).filter((c) => c.count > 0);
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

export type { Category, CategorySlug, Product, ProductType, Spec } from './types';
