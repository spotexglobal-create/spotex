import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Icon, PageHeader, Pill, ReadOnlyNotice, btnDark } from '@/components/admin/ui';
import { getCategories } from '@/lib/catalog';
import { getCatalogText } from '@/lib/catalog/text';
import { CATEGORY_SLUGS } from '@/lib/catalog/types';

export const metadata: Metadata = { title: 'Categories' };

export default async function AdminCategoriesPage() {
  const [categories, text] = await Promise.all([getCategories(), getCatalogText()]);
  const hidden = CATEGORY_SLUGS.filter((slug) => !categories.some((c) => c.slug === slug));

  return (
    <>
      <PageHeader eyebrow="Catalogue" title="Categories" text="Categories with products are shown on the website; empty ones stay hidden.">
        <button type="button" className={btnDark} disabled>
          <Icon name="plus" className="h-4 w-4" /> Add category
        </button>
      </PageHeader>
      <ReadOnlyNotice />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((c) => (
          <article key={c.slug} className="overflow-hidden rounded-[20px] border border-ink/10 bg-white">
            <div className="relative aspect-[16/9] bg-[#f3f3f3]">
              {c.cover && <Image src={c.cover} alt="" fill sizes="400px" className="object-cover mix-blend-multiply" />}
              <span className="absolute top-3 left-3">
                <Pill tone="green">Live</Pill>
              </span>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="display text-2xl leading-none text-ink">{text.categoryName(c.slug)}</h2>
                <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold text-white">{c.count}</span>
              </div>
              <p className="mt-1 font-mono text-xs text-ink/45">/{c.slug}</p>
              <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-ink/65">{text.categoryIntro(c.slug)}</p>
              <div className="mt-4 flex gap-2">
                <Link href={`/admin/products?category=${c.slug}`} className="text-xs font-bold text-brand hover:underline">
                  Products →
                </Link>
                <a href={`/en/products/${c.slug}`} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs font-semibold text-ink/50 hover:text-ink">
                  View on website
                </a>
              </div>
            </div>
          </article>
        ))}
        {hidden.map((slug) => (
          <article key={slug} className="flex flex-col justify-between rounded-[20px] border-[1.5px] border-dashed border-ink/15 p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="display text-2xl leading-none text-ink/50">{text.categoryName(slug)}</h2>
              <Pill tone="grey">Hidden · no products</Pill>
            </div>
            <p className="mt-3 text-[13px] text-ink/45">Appears on the website as soon as its first product is added.</p>
          </article>
        ))}
      </div>
    </>
  );
}
