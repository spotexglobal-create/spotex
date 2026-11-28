import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Card, Icon, PageHeader, Pill, StatCards, btnDark, btnLight } from '@/components/admin/ui';
import { getAdminCategories } from '@/lib/catalog';
import { getCatalogText } from '@/lib/catalog/text';

export const metadata: Metadata = { title: 'Categories' };

const ACTION = 'grid h-9 w-9 place-items-center rounded-full text-ink/70 hover:bg-ink/5 hover:text-brand';

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const [categories, text, { deleted }] = await Promise.all([getAdminCategories(), getCatalogText(), searchParams]);
  const live = categories.filter((c) => c.visible && c.liveCount > 0);
  const switchedOff = categories.filter((c) => !c.visible).length;
  const biggest = [...categories].sort((a, b) => b.count - a.count)[0];

  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title="Categories"
        text="Add a new category, edit each one's name, description and cover photo in all five languages, hide it, change its position, or delete an empty one. A category shows on the website when it is switched on and has a live product."
      >
        <Link href="/admin/products/new" className={btnLight}>
          <Icon name="plus" className="h-4 w-4" /> Add product
        </Link>
        <Link href="/admin/categories/new" className={btnDark}>
          <Icon name="plus" className="h-4 w-4" /> New category
        </Link>
      </PageHeader>
      {deleted === '1' && (
        <p className="mb-5 rounded-2xl border border-emerald-600/25 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">Category deleted.</p>
      )}
      <StatCards
        items={[
          { label: 'Categories', value: categories.length, icon: 'categories' },
          { label: 'Live on website', value: live.length, icon: 'eye' },
          {
            label: 'Not shown',
            value: categories.length - live.length,
            icon: 'edit',
            hint: switchedOff ? `${switchedOff} switched off` : categories.length - live.length ? 'No live products yet' : undefined,
          },
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
        <div className="hidden grid-cols-[60px_1fr_90px_120px_150px] gap-4 border-b border-ink/10 bg-[#fafafa] px-5 py-2.5 text-[10px] font-bold tracking-[0.14em] text-ink/65 uppercase md:grid">
          <span>Position</span>
          <span>Category</span>
          <span className="text-center">Products</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>
        <ul className="divide-y divide-ink/10">
          {categories.map((c) => {
            const status = !c.visible ? (
              <Pill tone="grey">Switched off</Pill>
            ) : c.liveCount === 0 ? (
              <Pill tone="amber">No products</Pill>
            ) : (
              <Pill tone="green">Live</Pill>
            );
            return (
              <li
                key={c.slug}
                className={`grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-3.5 transition-colors hover:bg-ink/[0.025] md:grid-cols-[60px_1fr_90px_120px_150px] ${
                  c.visible ? '' : 'bg-[#fafafa]'
                }`}
              >
                <span className="hidden font-mono text-sm text-ink/60 md:block">{c.order}</span>
                <Link href={`/admin/categories/${c.slug}`} className="flex min-w-0 items-center gap-4">
                  <span className="relative h-14 w-14 flex-none overflow-hidden rounded-xl border border-ink/10 bg-[#f3f3f3]">
                    {c.coverInUse ? (
                      <Image src={c.coverInUse} alt="" fill sizes="56px" className={`object-cover mix-blend-multiply ${c.visible ? '' : 'opacity-50'}`} />
                    ) : (
                      <span className="grid h-full place-items-center text-ink/40">
                        <Icon name="categories" className="h-5 w-5" />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-baseline gap-2">
                      <span className={`truncate text-[15px] font-bold ${c.visible ? 'text-ink' : 'text-ink/60'}`}>{text.categoryName(c.slug)}</span>
                      <span className="hidden font-mono text-[11px] text-ink/60 sm:inline">/{c.slug}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-ink/70">{text.categoryIntro(c.slug)}</span>
                    <span className="mt-1 block md:hidden">{status}</span>
                  </span>
                </Link>
                <span className="hidden text-center md:block">
                  <span className={`display text-2xl leading-none ${c.count ? 'text-ink' : 'text-ink/40'}`}>{c.count}</span>
                </span>
                <span className="hidden md:block">{status}</span>
                <span className="flex items-center justify-end gap-1">
                  <Link href={`/admin/categories/${c.slug}`} title="Edit category" className={ACTION}>
                    <Icon name="edit" className="h-4 w-4" />
                  </Link>
                  <Link href={`/admin/products?category=${c.slug}`} title="Products in this category" className={ACTION}>
                    <Icon name="products" className="h-4 w-4" />
                  </Link>
                  {c.visible && c.liveCount > 0 ? (
                    <a href={`/en/products/${c.slug}`} target="_blank" rel="noopener noreferrer" title="View on website" className={ACTION}>
                      <Icon name="eye" className="h-4 w-4" />
                    </a>
                  ) : (
                    <span className="h-9 w-9" aria-hidden />
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </Card>
    </>
  );
}
