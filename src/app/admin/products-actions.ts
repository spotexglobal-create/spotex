'use server';

import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin/auth';
import { CATALOG_TAG, getCategoryRecords } from '@/lib/catalog';
import { PRODUCT_TYPES, SPEC_LABELS, type Spec } from '@/lib/catalog/types';
import { connectDb, dbConfigured } from '@/lib/db/connect';
import { ProductModel } from '@/lib/db/models';
import en from '@/messages/en.json';

export interface ProductFormState {
  error?: string;
  /** Field names that failed validation. */
  fields?: string[];
}

const SPEC_VALUES = Object.keys(en.Catalog.values);
const UNITS = ['gsm', 'oz', 'cm'] as const;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** Photos in public/ (/products/…) or Cloudinary uploads; the only hosts next/image is allowed to load (next.config.ts). */
const IMAGE = /^(\/[\w\-./]+|https:\/\/res\.cloudinary\.com\/[^\s"'<>]+)$/;

const str = (form: FormData, key: string, max = 120) => String(form.get(key) ?? '').trim().slice(0, max);
const oneOf = <T extends string>(list: readonly T[], v: string): v is T => (list as readonly string[]).includes(v);

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function parseSpecs(raw: string): Spec[] | null {
  const list = parseJson(raw);
  if (!Array.isArray(list) || list.length > 20) return null;
  const specs: Spec[] = [];
  for (const s of list as Record<string, unknown>[]) {
    const label = String(s?.label ?? '');
    if (!oneOf(SPEC_LABELS, label)) return null;
    if (s.value != null && s.value !== '') {
      const value = String(s.value);
      if (!SPEC_VALUES.includes(value)) return null;
      specs.push({ label, value: value as Spec['value'] });
    } else {
      const amount = Number(s.amount);
      const unit = String(s.unit ?? 'gsm');
      if (!Number.isFinite(amount) || amount <= 0 || amount > 100000 || !oneOf(UNITS, unit)) return null;
      specs.push({ label, amount, unit });
    }
  }
  return specs;
}

function parseImages(raw: string): string[] | null {
  const list = parseJson(raw);
  if (!Array.isArray(list) || list.length > 12) return null;
  const images = list.map((v) => String(v).trim()).filter(Boolean);
  return images.every((src) => src.length < 600 && IMAGE.test(src)) ? images : null;
}

function noDatabase(): ProductFormState {
  return { error: 'Saving is not available right now, so the changes were not saved.' };
}

/** Creates a product, or updates the one named by "originalSlug". */
export async function saveProduct(_: ProductFormState, form: FormData): Promise<ProductFormState> {
  await requireAdmin();
  if (!dbConfigured()) return noDatabase();

  const originalSlug = str(form, 'originalSlug');
  const code = str(form, 'code', 40).toUpperCase();
  const slug = (str(form, 'slug', 80) || code).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const category = str(form, 'category');
  const type = str(form, 'type');
  const line = str(form, 'line', 60);
  const specs = parseSpecs(String(form.get('specs') ?? '[]'));
  const images = parseImages(String(form.get('images') ?? '[]'));

  const fields: string[] = [];
  if (!code) fields.push('code');
  if (!SLUG.test(slug)) fields.push('slug');
  if (!(await getCategoryRecords()).some((c) => c.slug === category)) fields.push('category');
  if (!oneOf(PRODUCT_TYPES, type)) fields.push('type');
  if (!specs) fields.push('specs');
  if (!images) fields.push('images');
  else if (!images.length) fields.push('images');
  if (fields.length) return { error: 'Please check the highlighted fields.', fields };

  await connectDb();
  const clash = slug !== originalSlug && (await ProductModel.exists({ slug }));
  if (clash) {
    return str(form, 'slug')
      ? { error: `Another product already uses the web address “${slug}”. Type a different URL slug.`, fields: ['slug'] }
      : { error: `Product ${code} already exists. Use a new product code, or open ${code} from the product list to edit it.`, fields: ['code'] };
  }

  const data = {
    slug,
    code,
    category,
    type,
    ...(line ? { line } : {}),
    specs: specs!,
    images: images!,
    featured: form.get('featured') === 'on',
    visible: form.get('visible') === 'on',
  };

  if (originalSlug) {
    const res = await ProductModel.updateOne({ slug: originalSlug }, { $set: data, ...(line ? {} : { $unset: { line: 1 } }) });
    if (!res.matchedCount) return { error: 'This product no longer exists. It may have been deleted.' };
  } else {
    const last = await ProductModel.findOne().sort({ order: -1 }).select('order').lean();
    await ProductModel.create({ ...data, order: (last?.order ?? 0) + 1 });
  }

  revalidateTag(CATALOG_TAG);
  redirect(`/admin/products/${slug}?saved=1`);
}

export async function deleteProduct(slug: string) {
  await requireAdmin();
  if (!dbConfigured()) return noDatabase();
  await connectDb();
  await ProductModel.deleteOne({ slug });
  revalidateTag(CATALOG_TAG);
  redirect('/admin/products?deleted=1');
}

/** Show or hide a product on the website from the products table. */
export async function setProductVisible(slug: string, visible: boolean): Promise<ProductFormState> {
  await requireAdmin();
  if (!dbConfigured()) return noDatabase();
  await connectDb();
  await ProductModel.updateOne({ slug }, { $set: { visible } });
  revalidateTag(CATALOG_TAG);
  return {};
}
