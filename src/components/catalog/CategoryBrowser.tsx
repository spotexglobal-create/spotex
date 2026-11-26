'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { Dropdown } from '@/components/ui/Dropdown';
import { Link, useRouter } from '@/i18n/navigation';
import type { CategorySlug } from '@/lib/catalog/types';

export interface BrowserCategory {
  slug: CategorySlug;
  name: string;
  intro: string;
  cover: string;
  count: number;
}
export interface BrowserProduct {
  slug: string;
  code: string;
  category: CategorySlug;
  name: string;
  image: string;
}

/**
 * Category overview with a search box, a category dropdown (picking one opens its page) and a sort order. Typing searches the whole catalogue:
 * matching products are listed straight away and only categories that contain a match stay visible.
 */
export function CategoryBrowser({
  categories,
  products,
}: {
  categories: BrowserCategory[];
  products: BrowserProduct[];
}) {
  const t = useTranslations('ProductsPage');
  const common = useTranslations('Common');
  const [query, setQuery] = useState('');
  const router = useRouter();
  const [sort, setSort] = useState<'default' | 'most' | 'name'>('default');

  const words = useMemo(() => query.toLowerCase().split(/\s+/).filter(Boolean), [query]);
  const nameOf = useMemo(() => new Map(categories.map((c) => [c.slug, c.name])), [categories]);
  const hits = useMemo(
    () =>
      words.length
        ? products.filter((p) => words.every((w) => `${p.name} ${p.code} ${nameOf.get(p.category)}`.toLowerCase().includes(w)))
        : [],
    [products, words, nameOf],
  );
  const filtered = categories.filter(
    (c) =>
      !words.length || hits.some((p) => p.category === c.slug) || words.every((w) => c.name.toLowerCase().includes(w)),
  );
  const shown =
    sort === 'most' ? [...filtered].sort((a, b) => b.count - a.count) : sort === 'name' ? [...filtered].sort((a, b) => a.name.localeCompare(b.name)) : filtered;

  return (
    <section className="container-page pt-6 pb-20">
      {/* toolbar */}
      <div className="flex flex-col gap-3 rounded-[22px] border-[1.5px] border-ink/30 bg-white p-3 md:flex-row md:items-center">
        <label className="relative w-full md:flex-1">
          <span className="sr-only">{t('searchLabel')}</span>
          <svg viewBox="0 0 24 24" aria-hidden className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 fill-none stroke-ink/50 stroke-2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchAll')}
            className="w-full rounded-full border-[1.5px] border-ink/30 bg-white py-3 pr-4 pl-11 text-sm text-ink outline-none placeholder:text-ink/45 focus:border-ink"
          />
        </label>
        <Dropdown
          className="md:w-64 md:flex-none"
          label={t('categoryLabel')}
          value=""
          options={[
            { value: '', label: t('allCategories'), hint: categories.length },
            ...categories.map((c) => ({ value: c.slug, label: c.name, hint: c.count })),
          ]}
          onChange={(v) => v && router.push({ pathname: '/products/[category]', params: { category: v as CategorySlug } })}
        />
        <Dropdown
          className="md:w-56 md:flex-none"
          label={t('sortLabel')}
          prefix={`${t('sortLabel')}:`}
          value={sort}
          options={[
            { value: 'default', label: t('sortDefault') },
            { value: 'most', label: t('sortMost') },
            { value: 'name', label: t('sortName') },
          ]}
          onChange={(v) => setSort(v as 'default' | 'most' | 'name')}
        />
      </div>

      {/* products matching the search */}
      {words.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-bold tracking-[0.16em] text-ink/85 uppercase" aria-live="polite">
            {common('products', { count: hits.length })}
          </p>
          {hits.length > 0 ? (
            <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {hits.slice(0, 9).map((p) => (
                <Link
                  key={p.slug}
                  href={{ pathname: '/products/[category]/[product]', params: { category: p.category, product: p.slug } }}
                  className="flex items-center gap-3 rounded-2xl border-[1.5px] border-ink/35 bg-white p-2 pr-4 transition-colors hover:border-ink"
                >
                  <span className="relative h-14 w-14 flex-none overflow-hidden rounded-xl bg-soft">
                    <Image src={p.image} alt="" fill sizes="56px" className="photo-multiply object-cover" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-extrabold tracking-[0.14em] text-brand">{p.code}</span>
                    <span className="block truncate text-sm font-semibold text-ink">{p.name}</span>
                    <span className="block text-[11px] text-ink/85">{nameOf.get(p.category)}</span>
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm">{t('noResults')}</p>
          )}
        </div>
      )}

      {/* categories */}
      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {shown.map((c) => (
          <Link
            key={c.slug}
            href={{ pathname: '/products/[category]', params: { category: c.slug } }}
            className="group grid min-h-[190px] grid-cols-[minmax(0,1fr)_36%] overflow-hidden sm:min-h-[210px] sm:grid-cols-[minmax(0,1fr)_42%] rounded-[22px] border-[1.5px] border-ink bg-white transition-[border-color,box-shadow] duration-300 hover:border-brand hover:shadow-[0_18px_40px_rgba(0,0,0,.08)]"
          >
            <span className="flex min-w-0 flex-col justify-between gap-4 p-4 sm:p-5 md:p-6">
              <span>
                <span className="text-[11px] font-extrabold tracking-[0.18em] text-brand">
                  {String(categories.indexOf(c) + 1).padStart(2, '0')} / {String(categories.length).padStart(2, '0')}
                </span>
                <span className="display mt-2 block text-[clamp(24px,7.5vw,34px)] leading-[0.95] break-words text-ink lg:text-[clamp(28px,2.6vw,40px)]">{c.name}</span>
                <span className="mt-2.5 line-clamp-2 block text-[13px] leading-relaxed text-ink/85">{c.intro}</span>
              </span>
              <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                <span className="rounded-full border-[1.5px] border-ink/30 px-3 py-1 text-[10.5px] font-bold tracking-[0.12em] text-ink uppercase">
                  {common('products', { count: c.count })}
                </span>
                <span className="text-xs font-bold tracking-[0.12em] text-brand uppercase">
                  {t('viewRange')} <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                </span>
              </span>
            </span>
            <span className="relative bg-soft">
              {c.cover && (
                <Image
                  src={c.cover}
                  alt={c.name}
                  fill
                  sizes="(min-width: 1024px) 20vw, 40vw"
                  className="photo-multiply object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                />
              )}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
