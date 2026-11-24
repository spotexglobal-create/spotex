import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { QuotesChart } from '@/components/admin/QuotesChart';
import { Card, CardTitle, Icon, PageHeader, Pill, StatCards, btnDark, btnLight, type Stat } from '@/components/admin/ui';
import { getInquiriesPerDay, getInquiryCounts } from '@/lib/admin/inquiries';
import { getAllProducts, getCategories } from '@/lib/catalog';
import { getCatalogText } from '@/lib/catalog/text';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const [products, categories, text, quotes, messages, perDay] = await Promise.all([
    getAllProducts(),
    getCategories(),
    getCatalogText(),
    getInquiryCounts('quote'),
    getInquiryCounts('message'),
    getInquiriesPerDay(30, 'quote'),
  ]);
  const max = Math.max(...categories.map((c) => c.count));
  const stats: Stat[] = [
    { label: 'Products', value: products.length, icon: 'products', href: '/admin/products' },
    { label: 'Categories', value: categories.length, icon: 'categories', href: '/admin/categories' },
    { label: 'New quote requests', value: quotes.new, icon: 'quotes', href: '/admin/quotes?status=new', alert: quotes.new > 0, hint: `${quotes.all} in total` },
    { label: 'New messages', value: messages.new, icon: 'chat', href: '/admin/messages?status=new', alert: messages.new > 0, hint: `${messages.all} in total` },
  ];

  return (
    <>
      <PageHeader eyebrow="Overview" title="Dashboard" text="A quick look at the catalogue and what is connected.">
        <Link href="/admin/products/new" className={btnDark}>
          <Icon name="plus" className="h-4 w-4" /> Add product
        </Link>
      </PageHeader>

      <StatCards items={stats} large />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardTitle title="Products by category">
            <Link href="/admin/categories" className="text-xs font-bold text-brand hover:underline">
              Manage
            </Link>
          </CardTitle>
          <ul className="space-y-3.5 p-5">
            {categories.map((c) => (
              <li key={c.slug} className="grid grid-cols-[150px_1fr_36px] items-center gap-3 text-sm">
                <span className="truncate font-semibold text-ink">{text.categoryName(c.slug)}</span>
                <span className="h-2.5 overflow-hidden rounded-full bg-ink/[0.06]">
                  <span className="block h-full rounded-full bg-brand" style={{ width: `${(c.count / max) * 100}%` }} />
                </span>
                <span className="text-right font-bold text-ink/70">{c.count}</span>
              </li>
            ))}
          </ul>
        </Card>

        <QuotesChart data={perDay} />
      </div>

      <Card className="mt-6 overflow-hidden">
        <CardTitle title="Latest products">
          <Link href="/admin/products" className={btnLight}>
            View all
          </Link>
        </CardTitle>
        <div className="hidden grid-cols-[1fr_160px_1.2fr_90px_24px] gap-4 border-b border-ink/10 bg-[#fafafa] px-5 py-2.5 text-[10px] font-bold tracking-[0.14em] text-ink/65 uppercase md:grid">
          <span>Product</span>
          <span>Category</span>
          <span>Specs</span>
          <span>Status</span>
          <span />
        </div>
        <ul className="divide-y divide-ink/10">
          {products
            .slice(-6)
            .reverse()
            .map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/admin/products/${p.slug}`}
                  className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-3 transition-colors hover:bg-ink/[0.025] md:grid-cols-[1fr_160px_1.2fr_90px_24px]"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="relative h-11 w-11 flex-none overflow-hidden rounded-lg border border-ink/10 bg-[#f3f3f3]">
                      {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="44px" className="object-contain p-0.5 mix-blend-multiply" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11px] font-extrabold tracking-[0.12em] text-brand">{p.code}</span>
                      <span className="block truncate text-sm font-semibold text-ink">{text.productName(p)}</span>
                    </span>
                  </span>
                  <span className="hidden truncate text-sm text-ink/70 md:block">{text.categoryName(p.category)}</span>
                  <span className="hidden truncate text-sm text-ink/70 md:block">{text.summary(p)}</span>
                  <span className="hidden md:block">{p.visible === false ? <Pill tone="grey">Hidden</Pill> : <Pill tone="green">Live</Pill>}</span>
                  <Icon name="edit" className="h-4 w-4 text-ink/60" />
                </Link>
              </li>
            ))}
        </ul>
      </Card>
    </>
  );
}
