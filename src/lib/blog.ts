import { unstable_cache } from 'next/cache';
import { POSTS, type Post } from '@/data/posts';
import { connectDb, dbConfigured } from '@/lib/db/connect';
import { PostModel } from '@/lib/db/models';

/**
 * Blog data access. With MONGODB_URI the articles come from MongoDB (managed in admin → Blog,
 * refreshed on save with revalidateTag(BLOG_TAG)); without it, from src/data/posts.ts.
 */

export const BLOG_TAG = 'blog';
export type { Post };

const byDate = (a: Post, b: Post) => b.date.localeCompare(a.date);

/** Plain object from a MongoDB record, safe to pass to client components. */
export function toPost(doc: Record<string, unknown>): Post {
  const d = doc as unknown as Post;
  return {
    slug: d.slug,
    title: d.title,
    excerpt: d.excerpt,
    date: d.date,
    topic: d.topic,
    minutes: d.minutes ?? 3,
    cover: d.cover,
    sections: (d.sections ?? []).map((s) => ({
      ...(s.heading ? { heading: s.heading } : {}),
      paragraphs: [...(s.paragraphs ?? [])],
      ...(s.points?.length ? { points: [...s.points] } : {}),
    })),
    published: d.published !== false,
  };
}

const loadFromDb = unstable_cache(
  async (): Promise<Post[]> => {
    await connectDb();
    const docs = await PostModel.find().sort({ date: -1, createdAt: -1 }).lean();
    return docs.map((d) => toPost(d));
  },
  ['blog-posts'],
  { tags: [BLOG_TAG], revalidate: 3600 },
);

/** Every article, drafts included (admin). Newest first. */
export async function getAllPosts(): Promise<Post[]> {
  return dbConfigured() ? loadFromDb() : [...POSTS].sort(byDate);
}

/** Published articles, newest first. */
export async function getPosts(): Promise<Post[]> {
  return (await getAllPosts()).filter((p) => p.published !== false);
}

export async function getPost(slug: string): Promise<Post | undefined> {
  return (await getPosts()).find((p) => p.slug === slug);
}
