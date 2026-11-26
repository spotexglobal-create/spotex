'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Dropdown } from '@/components/ui/Dropdown';
import { Link, useRouter } from '@/i18n/navigation';
import type { CategorySlug } from '@/lib/catalog/types';
import { Pagination } from './Pagination';

/** One product as the explorer needs it, already translated on the server. */
export interface ExplorerItem {
  slug: string;
  code: string;
  category: CategorySlug;
  name: string;
  summary: string;
  image: string;
  /** Spec rows, e.g. { group: 'Weave', value: 'Pearl' }; they become the sidebar filters. */
  specs: { group: string; value: string }[];
}

type Selected = Record<string, string[]>;

/** Products per page (three rows of four next to the sidebar). */
const PAGE_SIZE = 12;

/**
 * Product grid of one category: a filter sidebar built from the products' specs (weave, fabric,
 * weight …; any value inside a group, every group must match), live search kept in the URL as ?q=…,
 * a category switcher and a sort order.
 */
export function CatalogueExplorer({
  items,
  current,
  categories,
}: {
  items: ExplorerItem[];
  current: CategorySlug;
  categories: { slug: CategorySlug; name: string; count: number }[];
}) {
  const t = useTranslations('ProductsPage');
  const common = useTranslations('Common');
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'default' | 'code'>('default');
  const [selected, setSelected] = useState<Selected>({});
  const [panelOpen, setPanelOpen] = useState(false);
  const [page, setPage] = useState(1);
  const gridTop = useRef<HTMLDivElement>(null);

  useEffect(() => setQuery(new URLSearchParams(window.location.search).get('q') ?? ''), []);
  useEffect(() => {
    const q = query.trim();
    window.history.replaceState(null, '', `${window.location.pathname}${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  }, [query]);

  // filter groups: every spec group with at least two different values in this category
  const facets = useMemo(() => {
    const groups = new Map<string, Map<string, number>>();
    for (const p of items)
      for (const s of p.specs) {
        const values = groups.get(s.group) ?? new Map<string, number>();
        values.set(s.value, (values.get(s.value) ?? 0) + 1);
        groups.set(s.group, values);
      }
    return [...groups].filter(([, values]) => values.size > 1).map(([group, values]) => ({ group, values: [...values] }));
  }, [items]);

  const results = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const found = items.filter(
      (p) =>
        words.every((w) => `${p.name} ${p.code} ${p.summary}`.toLowerCase().includes(w)) &&
        Object.entries(selected).every(([group, values]) => !values.length || p.specs.some((s) => s.group === group && values.includes(s.value))),
    );
    return sort === 'code' ? [...found].sort((a, b) => a.code.localeCompare(b.code)) : found;
  }, [items, query, sort, selected]);

  // back to page 1 whenever the filters change
  useEffect(() => setPage(1), [query, sort, selected]);
  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const visible = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const goTo = (n: number) => {
    setPage(n);
    gridTop.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const active = Object.entries(selected).flatMap(([group, values]) => values.map((value) => ({ group, value })));
  const toggle = (group: string, value: string) =>
    setSelected((prev) => {
      const values = prev[group] ?? [];
      return { ...prev, [group]: values.includes(value) ? values.filter((v) => v !== value) : [...values, value] };
    });
  const clearAll = () => {
    setSelected({});
    setQuery('');
  };

  return (
    <section className="container-page pb-20">
      {/* toolbar: search · category · sort · count */}
      <div className="flex flex-col gap-3 rounded-[22px] border-[1.5px] border-ink/30 bg-white p-3 md:flex-row md:items-center">
        <label className="relative flex-1">
          <span className="sr-only">{t('searchLabel')}</span>
          <svg viewBox="0 0 24 24" aria-hidden className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 fill-none stroke-ink/50 stroke-2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full rounded-full border-[1.5px] border-ink/30 bg-soft py-2.5 pr-4 pl-11 text-sm text-ink outline-none placeholder:text-ink/45 focus:border-ink focus:bg-white"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {facets.length > 0 && (
            <button
              type="button"
              className="rounded-full border-[1.5px] border-ink bg-white px-4 py-2.5 text-sm font-semibold text-ink lg:hidden"
              aria-expanded={panelOpen}
              onClick={() => setPanelOpen((o) => !o)}
            >
              {t('filters')}
              {active.length > 0 && ` (${active.length})`}
            </button>
          )}
          <Dropdown
            className="min-w-56"
            label={t('categoryLabel')}
            value={current}
            options={categories.map((c) => ({ value: c.slug, label: c.name, hint: c.count }))}
            onChange={(v) => router.push({ pathname: '/products/[category]', params: { category: v as CategorySlug } })}
          />
          <Dropdown
            className="min-w-48"
            label={t('sortLabel')}
            prefix={`${t('sortLabel')}:`}
            value={sort}
            options={[
              { value: 'default', label: t('sortDefault') },
              { value: 'code', label: t('sortCode') },
            ]}
            onChange={(v) => setSort(v as 'default' | 'code')}
          />
          <span className="rounded-full bg-ink px-4 py-2.5 text-xs font-bold tracking-[0.12em] text-white uppercase" aria-live="polite">
            {common('products', { count: results.length })}
          </span>
        </div>
      </div>

      <div className={`mt-8 grid grid-cols-1 gap-8 ${facets.length ? 'lg:grid-cols-[250px_1fr]' : ''}`}>
        {/* sidebar filters */}
        {facets.length > 0 && (
          <aside className={`${panelOpen ? 'block' : 'hidden'} lg:block`} aria-label={t('filters')}>
            <div className="rounded-[20px] border-[1.5px] border-ink/30 p-5 lg:sticky lg:top-28">
              <div className="flex items-center justify-between">
                <p className="display text-2xl text-ink">{t('filters')}</p>
                {active.length > 0 && (
                  <button type="button" onClick={() => setSelected({})} className="text-xs font-bold tracking-[0.1em] text-brand uppercase hover:underline">
                    {t('clearAll')}
                  </button>
                )}
              </div>
              {facets.map(({ group, values }) => (
                <fieldset key={group} className="mt-5 border-t border-ink/12 pt-4">
                  <legend className="sr-only">{group}</legend>
                  <p aria-hidden className="text-[11px] font-bold tracking-[0.18em] text-ink/85 uppercase">
                    {group}
                  </p>
                  <ul className="mt-2.5 space-y-1">
                    {values.map(([value, count]) => {
                      const on = selected[group]?.includes(value) ?? false;
                      return (
                        <li key={value}>
                          <label className="group flex cursor-pointer items-center gap-3 rounded-lg py-1.5 text-sm text-ink">
                            <input type="checkbox" className="peer sr-only" checked={on} onChange={() => toggle(group, value)} />
                            <span
                              aria-hidden
                              className="grid h-[18px] w-[18px] flex-none place-items-center rounded-[5px] border-[1.5px] border-ink/40 text-[11px] text-white transition-colors group-hover:border-ink peer-checked:border-brand peer-checked:bg-brand peer-focus-visible:outline-2 peer-focus-visible:outline-brand"
                            >
                              {on && '✓'}
                            </span>
                            <span className="flex-1">{value}</span>
                            <span className="text-xs text-ink/45">{count}</span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </fieldset>
              ))}
            </div>
          </aside>
        )}

        <div ref={gridTop} className="scroll-mt-28">
          {/* active filters */}
          {active.length > 0 && (
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {active.map(({ group, value }) => (
                <button
                  key={`${group}:${value}`}
                  type="button"
                  onClick={() => toggle(group, value)}
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand"
                >
                  <span className="text-white/60">{group}:</span> {value} <span aria-hidden>×</span>
                </button>
              ))}
            </div>
          )}

          {results.length > 0 ? (
            <div className={`grid grid-cols-2 gap-3 md:gap-4 ${facets.length ? 'md:grid-cols-3 xl:grid-cols-4' : 'md:grid-cols-4 xl:grid-cols-5'}`}>
              {visible.map((p) => (
                <Link
                  key={p.slug}
                  href={{ pathname: '/products/[category]/[product]', params: { category: p.category, product: p.slug } }}
                  className="group flex flex-col overflow-hidden rounded-[18px] border-[1.5px] border-ink bg-white transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-brand"
                >
                  <div className="relative aspect-square bg-soft">
                    <Image
                      src={p.image}
                      alt={`${p.name} ${p.code}`}
                      fill
                      sizes="(min-width: 1280px) 17vw, (min-width: 768px) 24vw, 46vw"
                      className="photo-multiply object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-0.5 px-3.5 py-3">
                    <span className="text-[10.5px] font-extrabold tracking-[0.16em] text-brand">{p.code}</span>
                    <span className="display text-xl leading-tight text-ink">{p.name}</span>
                    <span className="line-clamp-2 text-[11.5px] leading-snug text-ink/85">{p.summary}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
          {results.length > 0 && <Pagination page={page} pages={pages} onChange={goTo} />}
          {results.length === 0 && (
            <div className="rounded-[20px] border-[1.5px] border-dashed border-ink/30 px-6 py-14 text-center">
              <p className="text-base text-ink">{t('noResults')}</p>
              <button type="button" className="btn btn-ghost mt-5" onClick={clearAll}>
                {t('clear')}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
