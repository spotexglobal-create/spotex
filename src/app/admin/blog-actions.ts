'use server';

import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin/auth';
import { BLOG_TAG } from '@/lib/blog';
import { connectDb, dbConfigured } from '@/lib/db/connect';
import { POST_TOPICS, PostModel } from '@/lib/db/models';

export interface PostFormState {
  error?: string;
  fields?: string[];
}

/** Photos in public/ or Cloudinary uploads: the hosts next/image may load (next.config.ts). */
const IMAGE = /^(\/[\w\-./]+|https:\/\/res\.cloudinary\.com\/[^\s"'<>]+)$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const str = (form: FormData, key: string, max: number) => String(form.get(key) ?? '').trim().slice(0, max);
const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);

interface Section {
  heading?: string;
  paragraphs: string[];
  points?: string[];
}

/** Sections arrive as JSON from the editor: { heading, text, points } with text split into paragraphs on blank lines. */
function parseSections(raw: string): Section[] | null {
  let list: unknown;
  try {
    list = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(list) || list.length > 30) return null;
  const sections: Section[] = [];
  for (const s of list as Record<string, unknown>[]) {
    const heading = String(s?.heading ?? '').trim().slice(0, 160);
    const paragraphs = String(s?.text ?? '')
      .split(/\n\s*\n/)
      .map((p) => p.replace(/\s*\n\s*/g, ' ').trim().slice(0, 4000))
      .filter(Boolean)
      .slice(0, 20);
    const points = String(s?.points ?? '')
      .split('\n')
      .map((p) => p.replace(/^[-•*]\s*/, '').trim().slice(0, 300))
      .filter(Boolean)
      .slice(0, 20);
    if (!heading && !paragraphs.length && !points.length) continue; // empty block
    sections.push({ ...(heading ? { heading } : {}), paragraphs, ...(points.length ? { points } : {}) });
  }
  return sections;
}

const readingMinutes = (title: string, excerpt: string, sections: Section[]) => {
  const text = [title, excerpt, ...sections.flatMap((s) => [s.heading ?? '', ...s.paragraphs, ...(s.points ?? [])])].join(' ');
  return Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 200));
};

/** Creates an article, or updates the one named by "originalSlug". */
export async function savePost(_: PostFormState, form: FormData): Promise<PostFormState> {
  await requireAdmin();
  if (!dbConfigured()) return { error: 'The database is not connected (MONGODB_URI is missing), so articles cannot be saved.' };

  const originalSlug = str(form, 'originalSlug', 80);
  const title = str(form, 'title', 160);
  const slug = slugify(str(form, 'slug', 80) || title);
  const excerpt = str(form, 'excerpt', 400);
  const date = str(form, 'date', 10);
  const topic = str(form, 'topic', 20);
  const cover = str(form, 'cover', 600);
  const sections = parseSections(String(form.get('sections') ?? '[]'));

  const fields: string[] = [];
  if (!title) fields.push('title');
  if (!SLUG.test(slug)) fields.push('slug');
  if (excerpt.length < 10) fields.push('excerpt');
  if (!DATE.test(date) || Number.isNaN(Date.parse(date))) fields.push('date');
  if (!(POST_TOPICS as readonly string[]).includes(topic)) fields.push('topic');
  if (!IMAGE.test(cover)) fields.push('cover');
  if (!sections || !sections.some((s) => s.paragraphs.length)) fields.push('sections');
  if (fields.length) return { error: 'Please check the highlighted fields.', fields };

  await connectDb();
  if (slug !== originalSlug && (await PostModel.exists({ slug }))) {
    return { error: `Another article already uses the URL “${slug}”.`, fields: ['slug'] };
  }

  const data = {
    slug,
    title,
    excerpt,
    date,
    topic,
    cover,
    sections: sections!,
    minutes: readingMinutes(title, excerpt, sections!),
    published: form.get('published') === 'on',
  };

  if (originalSlug) {
    const res = await PostModel.updateOne({ slug: originalSlug }, { $set: data });
    if (!res.matchedCount) return { error: 'This article no longer exists. It may have been deleted.' };
  } else {
    await PostModel.create(data);
  }

  revalidateTag(BLOG_TAG);
  redirect(`/admin/blog/${slug}?saved=1`);
}

export async function deletePost(slug: string) {
  await requireAdmin();
  if (!dbConfigured()) return;
  await connectDb();
  await PostModel.deleteOne({ slug });
  revalidateTag(BLOG_TAG);
  redirect('/admin/blog?deleted=1');
}
