'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import { setProductVisible } from '@/app/admin/products-actions';
import { Icon, Pill } from './ui';

interface Row {
  slug: string;
  code: string;
  name: string;
  category: string;
  categoryName: string;
  summary: string;
  image: string;
  photos: number;
  featured: boolean;
  visible: boolean;
}

const PAGE = 15;

/** Searchable, filterable product table with paging. */
export function ProductsTable({
  rows,
  categories,
  initialCategory = '',
  dbReady = false,
}: {
  rows: Row[];
  categories: { slug: string; name: string }[];
  initialCategory?: string;
  dbReady?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState('');
  const toggle = (r: Row) => {
    setBusy(r.slug);
    startTransition(async () => {
      const res = await setProductVisible(r.slug, !r.visible);
      if (res.error) alert(res.error);
      router.refresh();
      setBusy('');
    });
  };
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [page, setPage] = useState(1);

  const found = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return rows.filter(
      (r) => (!category || r.category === category) && words.every((w) => `${r.code} ${r.name} ${r.summary}`.toLowerCase().includes(w)),
    );
  }, [rows, query, category]);
  const pages = Math.max(1, Math.ceil(found.length / PAGE));
  const shown = found.slice((page - 1) * PAGE, page * PAGE);

  return (
    <section className="overflow-hidden rounded-[20px] border border-ink bg-white">
      {/* toolbar */}
      <div className="flex flex-col gap-3 border-b border-ink/10 p-4 md:flex-row md:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search</span>
          <svg viewBox="0 0 24 24" aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 fill-none stroke-ink/40 stroke-2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by code, name or spec…"
            className="w-full rounded-xl border-[1.5px] border-ink bg-[#fafafa] py-2.5 pr-3 pl-10 text-sm outline-none focus:border-brand focus:bg-white"
          />
        </label>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border-[1.5px] border-ink bg-white px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-brand"
          aria-label="Category"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <span className="text-xs font-bold text-ink/70">{found.length} results</span>
      </div>

      {/* table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-[#fafafa] text-[11px] font-bold tracking-[0.12em] text-ink/70 uppercase">
            <tr>
              <th className="px-5 py-3">Product</th>
              <th className="px-3 py-3">Category</th>
              <th className="px-3 py-3">Specs</th>
              <th className="px-3 py-3">Photos</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/[0.07]">
            {shown.map((r) => (
              <tr key={r.slug} className="hover:bg-ink/[0.015]">
                <td className="px-5 py-3">
                  <Link href={`/admin/products/${r.slug}`} className="flex items-center gap-3">
                    <span className="relative h-11 w-11 flex-none overflow-hidden rounded-lg bg-[#f3f3f3]">
                      {r.image && <Image src={r.image} alt="" fill sizes="44px" className="object-cover mix-blend-multiply" />}
                    </span>
                    <span>
                      <span className="block text-[11px] font-extrabold tracking-[0.12em] text-brand">{r.code}</span>
                      <span className="block font-semibold text-ink">{r.name}</span>
                    </span>
                  </Link>
                </td>
                <td className="px-3 py-3 text-ink/70">{r.categoryName}</td>
                <td className="max-w-[260px] truncate px-3 py-3 text-ink/75">{r.summary}</td>
                <td className="px-3 py-3 text-ink/70">{r.photos}</td>
                <td className="px-3 py-3">
                  <span className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggle(r)}
                      disabled={!dbReady || pending}
                      title={dbReady ? (r.visible ? 'Hide from the website' : 'Show on the website') : 'Needs the database'}
                      className={`rounded-full disabled:cursor-default ${busy === r.slug ? 'opacity-50' : ''}`}
                    >
                      {r.visible ? <Pill tone="green">Live</Pill> : <Pill tone="grey">Hidden</Pill>}
                    </button>
                    {r.featured && <Pill tone="red">Featured</Pill>}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className="flex justify-end gap-1.5">
                    <Link href={`/admin/products/${r.slug}`} title="Edit" className="rounded-lg p-2 text-ink/75 hover:bg-ink/5 hover:text-ink">
                      <Icon name="edit" className="h-4 w-4" />
                    </Link>
                    <a
                      href={`/en/products/${r.category}/${r.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View on website"
                      className="rounded-lg p-2 text-ink/75 hover:bg-ink/5 hover:text-ink"
                    >
                      <Icon name="eye" className="h-4 w-4" />
                    </a>
                  </span>
                </td>
              </tr>
            ))}
            {!shown.length && (
              <tr>
                <td colSpan={6} className="px-5 py-14 text-center text-sm text-ink/70">
                  No products match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* paging */}
      {pages > 1 && (
        <div className="flex items-center justify-between border-t border-ink/10 px-5 py-3 text-xs font-semibold text-ink/75">
          <span>
            Page {page} of {pages}
          </span>
          <span className="flex gap-1.5">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={`h-8 min-w-8 rounded-lg px-2 ${n === page ? 'bg-ink text-white' : 'hover:bg-ink/5'}`}
              >
                {n}
              </button>
            ))}
          </span>
        </div>
      )}
    </section>
  );
}
