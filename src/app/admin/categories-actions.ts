'use server';

import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin/auth';
import { CATALOG_TAG, getCategoryRecords } from '@/lib/catalog';
import { CATEGORY_LOCALES, CATEGORY_SLUG_RE, type LocalizedText } from '@/lib/catalog/types';
import { connectDb, dbConfigured } from '@/lib/db/connect';
import { CategoryModel, ProductModel } from '@/lib/db/models';

export interface CategoryFormState {
  error?: string;
  saved?: boolean;
  /** Names of fields with a problem, highlighted in the form. */
  fields?: string[];
}

const str = (form: FormData, name: string, max: number) => String(form.get(name) ?? '').trim().slice(0, max);

/** "Gi Bags & Packs" → "gi-bags-packs" */
const toSlug = (text: string) =>
  text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

/** A Cloudinary upload, or a photo already on this website (e.g. /products/…). */
const COVER = /^(https:\/\/res\.cloudinary\.com\/[\w-]+\/image\/upload\/[^\s"'<>]+|\/[\w./-]+\.(?:webp|jpe?g|png|avif))$/i;

/**
 * Saves one category (admin → Categories → Edit), or creates a new one (… → New category). A new
 * category gets its web address from the slug field, or from its English name. The website updates
 * within seconds.
 */
export async function saveCategory(_: CategoryFormState, form: FormData): Promise<CategoryFormState> {
  await requireAdmin();
  if (!dbConfigured()) return { error: 'Saving is not available right now, so the category was not saved.' };

  const isNew = form.get('isNew') === '1';
  const name: LocalizedText = {};
  const intro: LocalizedText = {};
  for (const l of CATEGORY_LOCALES) {
    name[l] = str(form, `name_${l}`, 60);
    intro[l] = str(form, `intro_${l}`, 600);
  }
  const slug = isNew ? toSlug(str(form, 'slug', 60) || name.en || '') : str(form, 'slug', 60);
  const cover = str(form, 'cover', 500);
  const order = Number(str(form, 'order', 6));
  const visible = form.get('visible') === 'on';

  const fields: string[] = [];
  if (!name.en) fields.push('name_en');
  if (!intro.en) fields.push('intro_en');
  if (!CATEGORY_SLUG_RE.test(slug)) fields.push('slug');
  if (cover && !COVER.test(cover)) fields.push('cover');
  if (!Number.isInteger(order) || order < 0 || order > 9999) fields.push('order');
  if (fields.length) return { error: 'Please check the highlighted fields.', fields };

  await connectDb();
  // the first save writes every category, so the database (not the built-in list) becomes the real list
  if (!(await CategoryModel.exists({}))) {
    const records = await getCategoryRecords();
    await CategoryModel.insertMany(records.map((r) => ({ ...r })));
  }
  const exists = await CategoryModel.exists({ slug });
  if (isNew && exists) return { error: `A category with the web address “/${slug}” already exists. Choose another name or address.`, fields: ['slug'] };
  if (!isNew && !exists) return { error: 'This category no longer exists.' };

  await CategoryModel.updateOne({ slug }, { $set: { name, intro, cover, order, visible } }, { upsert: true });
  revalidateTag(CATALOG_TAG);
  if (isNew) redirect(`/admin/categories/${slug}?created=1`);
  return { saved: true };
}

/** Deletes an empty category (admin → Categories → Edit → Delete). Categories with products are kept. */
export async function deleteCategory(slug: string): Promise<{ error?: string }> {
  await requireAdmin();
  if (!dbConfigured()) return { error: 'Deleting is not available right now.' };
  if (!CATEGORY_SLUG_RE.test(slug)) return { error: 'Unknown category.' };

  await connectDb();
  const products = await ProductModel.countDocuments({ category: slug });
  if (products) {
    return { error: `This category still has ${products} product${products === 1 ? '' : 's'}. Move them to another category or delete them first.` };
  }
  if (!(await CategoryModel.exists({}))) {
    const records = await getCategoryRecords();
    await CategoryModel.insertMany(records.map((r) => ({ ...r })));
  }
  if ((await CategoryModel.countDocuments()) <= 1) return { error: 'The website needs at least one category.' };
  await CategoryModel.deleteOne({ slug });
  revalidateTag(CATALOG_TAG);
  redirect('/admin/categories?deleted=1');
}
