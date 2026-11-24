import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostForm } from '@/components/admin/PostForm';
import { PageHeader } from '@/components/admin/ui';
import { getAllPosts } from '@/lib/blog';
import { dbConfigured } from '@/lib/db/connect';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ saved?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug === 'new' ? 'New article' : 'Edit article' };
}

export default async function AdminPostPage({ params, searchParams }: Props) {
  const [{ slug }, { saved }] = await Promise.all([params, searchParams]);
  const post = slug === 'new' ? undefined : (await getAllPosts()).find((p) => p.slug === slug);
  if (slug !== 'new' && !post) notFound();

  return (
    <>
      <PageHeader eyebrow="Blog" title={post ? 'Edit article' : 'New article'} text={post?.title ?? 'Write an article for the website blog (English).'} />
      <PostForm key={post?.slug ?? 'new'} post={post} dbReady={dbConfigured()} saved={saved === '1'} />
    </>
  );
}
