'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useActionState, useState, useTransition } from 'react';
import { deletePost, savePost, type PostFormState } from '@/app/admin/blog-actions';
import type { Post } from '@/data/posts';
import { ImageUpload } from './ImageUpload';
import { Card, CardTitle, Icon, btnDark, btnLight, field, fieldLabel } from './ui';

const TOPICS = [
  { value: 'guides', label: 'Guides' },
  { value: 'private-label', label: 'Private label' },
  { value: 'factory', label: 'Factory' },
];

/** Same rule as the server: photos in public/ or Cloudinary. */
const IMAGE = /^(\/[\w\-./]+|https:\/\/res\.cloudinary\.com\/[^\s"'<>]+)$/;

/** One editable block: optional heading, text (blank line = new paragraph) and an optional bullet list. */
interface Block {
  heading: string;
  text: string;
  points: string;
}

const toBlock = (s: Post['sections'][number]): Block => ({ heading: s.heading ?? '', text: s.paragraphs.join('\n\n'), points: (s.points ?? []).join('\n') });
const today = () => new Date().toISOString().slice(0, 10);

export function PostForm({ post, dbReady, saved }: { post?: Post; dbReady: boolean; saved?: boolean }) {
  const [state, action, saving] = useActionState<PostFormState, FormData>(savePost, {});
  const [blocks, setBlocks] = useState<Block[]>(post?.sections.map(toBlock) ?? [{ heading: '', text: '', points: '' }]);
  const [cover, setCover] = useState(post?.cover ?? '');
  const [deleting, startDelete] = useTransition();
  const disabled = !dbReady || saving;
  const bad = (name: string) => (state.fields?.includes(name) ? '!border-brand' : '');

  const setBlock = (i: number, patch: Partial<Block>) => setBlocks((list) => list.map((b, j) => (j === i ? { ...b, ...patch } : b)));
  const move = (i: number, to: number) =>
    setBlocks((list) => {
      if (to < 0 || to >= list.length) return list;
      const next = [...list];
      [next[i], next[to]] = [next[to], next[i]];
      return next;
    });

  const onDelete = () => {
    if (!post || !confirm(`Delete “${post.title}”? It disappears from the website. This cannot be undone.`)) return;
    startDelete(async () => {
      await deletePost(post.slug);
    });
  };

  return (
    <form action={action}>
      {!dbReady && (
        <p className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <b>Read-only.</b> Saving switches on when the database (MONGODB_URI) is connected.
        </p>
      )}
      {saved && !state.error && (
        <p className="mb-6 rounded-2xl border border-emerald-600/25 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          Saved. {post?.published === false ? 'It is a draft, so only the admin can see it.' : 'The article is live on the website.'}
        </p>
      )}
      {state.error && (
        <p role="alert" className="mb-6 rounded-2xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm font-semibold text-brand">
          {state.error}
        </p>
      )}

      <input type="hidden" name="originalSlug" value={post?.slug ?? ''} />
      <input type="hidden" name="sections" value={JSON.stringify(blocks)} />

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card>
            <CardTitle title="Article" />
            <div className="space-y-4 p-5">
              <label className="block">
                <span className={fieldLabel}>Title</span>
                <input name="title" defaultValue={post?.title} required maxLength={160} className={`${field} ${bad('title')}`} disabled={disabled} placeholder="e.g. How to choose a judo gi weight" />
              </label>
              <label className="block">
                <span className={fieldLabel}>Short summary</span>
                <textarea name="excerpt" defaultValue={post?.excerpt} rows={2} maxLength={400} className={`${field} ${bad('excerpt')}`} disabled={disabled} placeholder="One or two sentences shown on the blog page and in Google." />
              </label>
            </div>
          </Card>

          <Card>
            <CardTitle title="Text">
              <button type="button" className={btnLight} disabled={disabled || blocks.length >= 30} onClick={() => setBlocks([...blocks, { heading: '', text: '', points: '' }])}>
                <Icon name="plus" className="h-3.5 w-3.5" /> Add section
              </button>
            </CardTitle>
            <div className={`divide-y divide-ink/[0.08] ${state.fields?.includes('sections') ? 'ring-1 ring-brand ring-inset' : ''}`}>
              {blocks.map((b, i) => (
                <div key={i} className="space-y-3 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-bold tracking-[0.14em] text-ink/40 uppercase">Section {i + 1}</span>
                    <span className="flex gap-1 text-xs font-bold text-ink/45">
                      <button type="button" onClick={() => move(i, i - 1)} disabled={disabled || i === 0} className="rounded px-2 py-1 hover:bg-ink/5 disabled:opacity-30" aria-label="Move up">
                        ↑
                      </button>
                      <button type="button" onClick={() => move(i, i + 1)} disabled={disabled || i === blocks.length - 1} className="rounded px-2 py-1 hover:bg-ink/5 disabled:opacity-30" aria-label="Move down">
                        ↓
                      </button>
                      <button type="button" onClick={() => setBlocks(blocks.filter((_, j) => j !== i))} disabled={disabled || blocks.length === 1} className="rounded px-2 py-1 hover:bg-ink/5 hover:text-brand disabled:opacity-30">
                        Remove
                      </button>
                    </span>
                  </div>
                  <input value={b.heading} onChange={(e) => setBlock(i, { heading: e.target.value })} className={`${field} mt-0 font-bold`} disabled={disabled} placeholder={i === 0 ? 'Heading (optional; the first section is usually the intro)' : 'Heading'} maxLength={160} />
                  <textarea value={b.text} onChange={(e) => setBlock(i, { text: e.target.value })} rows={6} className={`${field} mt-0 leading-relaxed`} disabled={disabled} placeholder="Text. Leave an empty line to start a new paragraph." />
                  <textarea value={b.points} onChange={(e) => setBlock(i, { points: e.target.value })} rows={2} className={`${field} mt-0 text-[13px]`} disabled={disabled} placeholder="Bullet points (optional): one per line" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardTitle title="Publishing" />
            <div className="space-y-4 p-5">
              <label className="flex items-center justify-between gap-3 text-sm font-semibold">
                Published on website
                <input name="published" type="checkbox" defaultChecked={post?.published !== false} className="h-4 w-4 accent-[var(--color-brand)]" disabled={disabled} />
              </label>
              <label className="block">
                <span className={fieldLabel}>Date</span>
                <input name="date" type="date" defaultValue={post?.date ?? today()} className={`${field} ${bad('date')}`} disabled={disabled} />
              </label>
              <label className="block">
                <span className={fieldLabel}>Topic</span>
                <select name="topic" defaultValue={post?.topic ?? 'guides'} className={`${field} ${bad('topic')}`} disabled={disabled}>
                  {TOPICS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={fieldLabel}>URL</span>
                <input name="slug" defaultValue={post?.slug} className={`${field} ${bad('slug')}`} disabled={disabled} placeholder="made from the title if empty" />
              </label>
              <button type="submit" className={`${btnDark} w-full justify-center`} disabled={disabled}>
                {saving ? 'Saving…' : post ? 'Save article' : 'Create article'}
              </button>
              {post && post.published !== false && (
                <a href={`/en/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className={`${btnLight} w-full justify-center`}>
                  <Icon name="eye" className="h-4 w-4" /> View on website
                </a>
              )}
              {post && dbReady && (
                <button type="button" onClick={onDelete} disabled={deleting || saving} className="w-full rounded-full px-4 py-2 text-xs font-bold tracking-[0.08em] text-brand uppercase hover:bg-brand/5 disabled:opacity-40">
                  {deleting ? 'Deleting…' : 'Delete article'}
                </button>
              )}
            </div>
          </Card>

          <Card>
            <CardTitle title="Cover photo" />
            <div className="space-y-3 p-5">
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[#f3f3f3]">
                {IMAGE.test(cover) ? (
                  <Image src={cover} alt="" fill sizes="300px" className="object-contain p-3 mix-blend-multiply" />
                ) : (
                  <span className="grid h-full place-items-center text-xs text-ink/40">No photo yet</span>
                )}
              </div>
              <ImageUpload folder="blog" label={cover ? 'Replace photo' : 'Upload photo'} disabled={disabled} onUploaded={([url]) => setCover(url)} />
              <input name="cover" value={cover} onChange={(e) => setCover(e.target.value.trim())} className={`${field} mt-0 ${bad('cover')}`} disabled={disabled} placeholder="/products/photo.webp" />
              <p className="text-xs text-ink/45">Upload a photo, or use one already on the website (/products/…).</p>
            </div>
          </Card>

          <Link href="/admin/blog" className="inline-block text-xs font-semibold text-ink/50 hover:text-brand">
            ← All articles
          </Link>
        </div>
      </div>
    </form>
  );
}
