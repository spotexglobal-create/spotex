import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Card, Icon, PageHeader, Pill, btnDark } from '@/components/admin/ui';
import { getAllPosts } from '@/lib/blog';
import { dbConfigured } from '@/lib/db/connect';

export const metadata: Metadata = { title: 'Blog' };

const TOPIC: Record<string, string> = { guides: 'Guides', 'private-label': 'Private label', factory: 'Factory' };

export default async function AdminBlogPage({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const { deleted } = await searchParams;
  const posts = await getAllPosts();
  const drafts = posts.filter((p) => p.published === false).length;

  return (
    <>
      <PageHeader eyebrow="Content" title="Blog" text={`${posts.length} articles${drafts ? `, ${drafts} draft${drafts > 1 ? 's' : ''}` : ''}. Newest first, as on the website.`}>
        <Link href="/admin/blog/new" className={btnDark}>
          <Icon name="plus" className="h-4 w-4" /> New article
        </Link>
      </PageHeader>

      {!dbConfigured() && (
        <p className="mb-5 rounded-2xl border border-amber-500/30 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <b>Database not connected.</b> These are the built-in articles; writing new ones needs MONGODB_URI.
        </p>
      )}
      {deleted === '1' && <p className="mb-5 rounded-2xl border border-emerald-600/25 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">Article deleted.</p>}

      <Card className="overflow-hidden">
        <ul className="divide-y divide-ink/[0.08]">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={`/admin/blog/${p.slug}`} className="flex items-center gap-4 px-5 py-4 hover:bg-ink/[0.015]">
                <span className="relative h-14 w-20 flex-none overflow-hidden rounded-lg bg-[#f3f3f3]">
                  {p.cover && <Image src={p.cover} alt="" fill sizes="80px" className="object-contain p-1 mix-blend-multiply" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-ink">{p.title}</span>
                  <span className="block text-xs text-ink/50">
                    {p.date} · {TOPIC[p.topic] ?? p.topic} · {p.minutes} min read
                  </span>
                </span>
                {p.published === false ? <Pill tone="grey">Draft</Pill> : <Pill tone="green">Live</Pill>}
                <Icon name="edit" className="h-4 w-4 text-ink/40" />
              </Link>
            </li>
          ))}
          {!posts.length && <li className="px-5 py-14 text-center text-sm text-ink/50">No articles yet. Write the first one.</li>}
        </ul>
      </Card>
    </>
  );
}
