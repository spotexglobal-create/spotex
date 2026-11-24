import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Card, Icon, PageHeader, Pill, StatCards, btnDark } from '@/components/admin/ui';
import { getCategories } from '@/lib/catalog';
import { getCatalogText } from '@/lib/catalog/text';
import { CATEGORY_SLUGS } from '@/lib/catalog/types';

export const metadata: Metadata = { title: 'Categories' };

export default async function AdminCategoriesPage() {
  const [categories, text] = await Promise.all([getCategories(), getCatalogText()]);
  const hidden = CATEGORY_SLUGS.filter((slug) => !categories.some((c) => c.slug === slug));
  const biggest = [...categories].sort((a, b) => b.count - a.count)[0];

  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title="Categories"
        text={`The ${CATEGORY_SLUGS.length} categories are fixed. A category shows on the website as soon as it has a product; empty ones stay hidden.`}
      >
        <Link href="/admin/products/new" className={btnDark}>
          <Icon name="plus" className="h-4 w-4" /> Add product
        </Link>
      </PageHeader>
      <StatCards
        items={[
          { label: 'Categories', value: CATEGORY_SLUGS.length, icon: 'categories' },
          { label: 'Live on website', value: categories.length, icon: 'eye' },
          { label: 'Empty (hidden)', value: hidden.length, icon: 'edit', hint: hidden.length ? 'Add a product to show them' : undefined },
          {
            label: 'Products',
            value: categories.reduce((n, c) => n + c.count, 0),
            icon: 'products',
            href: '/admin/products',
            hint: biggest ? `Most: ${text.categoryName(biggest.slug)} (${biggest.count})` : undefined,
          },
        ]}
      />

      <Card className="overflow-hidden">
        <div className="hidden grid-cols-[1fr_90px_110px_150px] gap-4 border-b border-ink/10 bg-[#fafafa] px-5 py-2.5 text-[10px] font-bold tracking-[0.14em] text-ink/65 uppercase md:grid">
          <span>Category</span>
          <span className="text-center">Products</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>
        <ul className="divide-y divide-ink/10">
          {categories.map((c) => (
            <li key={c.slug} className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-3.5 transition-colors hover:bg-ink/[0.025] md:grid-cols-[1fr_90px_110px_150px]">
              <Link href={`/admin/products?category=${c.slug}`} className="flex min-w-0 items-center gap-4">
                <span className="relative h-14 w-14 flex-none overflow-hidden rounded-xl border border-ink/10 bg-[#f3f3f3]">
                  {c.cover && <Image src={c.cover} alt="" fill sizes="56px" className="object-cover mix-blend-multiply" />}
                </span>
                <span className="min-w-0">
                  <span className="flex items-baseline gap-2">
                    <span className="truncate text-[15px] font-bold text-ink">{text.categoryName(c.slug)}</span>
                    <span className="hidden font-mono text-[11px] text-ink/60 sm:inline">/{c.slug}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-ink/70">{text.categoryIntro(c.slug)}</span>
                </span>
              </Link>
              <span className="hidden text-center md:block">
                <span className="display text-2xl leading-none text-ink">{c.count}</span>
              </span>
              <span className="hidden md:block">
                <Pill tone="green">Live</Pill>
              </span>
              <span className="flex items-center justify-end gap-1">
                <Link
                  href={`/admin/products?category=${c.slug}`}
                  title="Products in this category"
                  className="grid h-9 w-9 place-items-center rounded-full text-ink/70 hover:bg-ink/5 hover:text-brand"
                >
                  <Icon name="products" className="h-4 w-4" />
                </Link>
                <a
                  href={`/en/products/${c.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View on website"
                  className="grid h-9 w-9 place-items-center rounded-full text-ink/70 hover:bg-ink/5 hover:text-brand"
                >
                  <Icon name="eye" className="h-4 w-4" />
                </a>
                <Icon name="chevron" className="ml-1 h-4 w-4 -rotate-90 text-ink/50" />
              </span>
            </li>
          ))}
          {hidden.map((slug) => (
            <li key={slug} className="grid grid-cols-[1fr_auto] items-center gap-4 bg-[#fafafa] px-5 py-3.5 md:grid-cols-[1fr_90px_110px_150px]">
              <span className="flex min-w-0 items-center gap-4">
                <span className="grid h-14 w-14 flex-none place-items-center rounded-xl border border-dashed border-ink/30 text-ink/50">
                  <Icon name="categories" className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-bold text-ink/70">{text.categoryName(slug)}</span>
                  <span className="mt-0.5 block truncate text-xs text-ink/65">Shows on the website as soon as its first product is added.</span>
                </span>
              </span>
              <span className="hidden text-center md:block">
                <span className="display text-2xl leading-none text-ink/50">0</span>
              </span>
              <span className="hidden md:block">
                <Pill tone="grey">Hidden</Pill>
              </span>
              <span className="flex justify-end">
                <Link href="/admin/products/new" className="text-xs font-bold text-brand hover:underline">
                  Add product
                </Link>
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
