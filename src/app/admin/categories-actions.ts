'use server';

import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';
import { CATALOG_TAG, isCategorySlug } from '@/lib/catalog';
import { CATEGORY_LOCALES, type LocalizedText } from '@/lib/catalog/types';
import { connectDb, dbConfigured } from '@/lib/db/connect';
import { CategoryModel } from '@/lib/db/models';

export interface CategoryFormState {
  error?: string;
  saved?: boolean;
  /** Names of fields with a problem, highlighted in the form. */
  fields?: string[];
}

const str = (form: FormData, name: string, max: number) => String(form.get(name) ?? '').trim().slice(0, max);

/** A Cloudinary upload, or a photo already on this website (e.g. /products/…). */
const COVER = /^(https:\/\/res\.cloudinary\.com\/[\w-]+\/image\/upload\/[^\s"'<>]+|\/[\w./-]+\.(?:webp|jpe?g|png|avif))$/i;

/** Saves one category (admin → Categories → Edit). The website updates within seconds. */
export async function saveCategory(_: CategoryFormState, form: FormData): Promise<CategoryFormState> {
  await requireAdmin();
  if (!dbConfigured()) return { error: 'Saving is not available right now, so the category was not saved.' };

  const slug = str(form, 'slug', 60);
  if (!isCategorySlug(slug)) return { error: 'Unknown category.' };

  const name: LocalizedText = {};
  const intro: LocalizedText = {};
  for (const l of CATEGORY_LOCALES) {
    name[l] = str(form, `name_${l}`, 60);
    intro[l] = str(form, `intro_${l}`, 600);
  }
  const cover = str(form, 'cover', 500);
  const order = Number(str(form, 'order', 6));
  const visible = form.get('visible') === 'on';

  const fields: string[] = [];
  if (!name.en) fields.push('name_en');
  if (!intro.en) fields.push('intro_en');
  if (cover && !COVER.test(cover)) fields.push('cover');
  if (!Number.isInteger(order) || order < 0 || order > 9999) fields.push('order');
  if (fields.length) return { error: 'Please check the highlighted fields.', fields };

  await connectDb();
  await CategoryModel.updateOne({ slug }, { $set: { name, intro, cover, order, visible } }, { upsert: true });
  revalidateTag(CATALOG_TAG);
  return { saved: true };
}
