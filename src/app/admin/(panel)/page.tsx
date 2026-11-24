import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardTitle, Icon, PageHeader, Pill, btnDark, btnLight, type ICONS } from '@/components/admin/ui';
import { routing } from '@/i18n/routing';
import { getInquiryCounts } from '@/lib/admin/inquiries';
import { getAllProducts, getCategories } from '@/lib/catalog';
import { cloudinaryConfig } from '@/lib/cloudinary';
import { getCatalogText } from '@/lib/catalog/text';

export const metadata: Metadata = { title: 'Dashboard' };

/** What the deployment is connected to, read from the environment (never shows secret values). */
function integrations() {
  return [
    { name: 'Database', detail: 'MongoDB Atlas: products, quotes, settings', on: Boolean(process.env.MONGODB_URI), icon: 'database' as const },
    { name: 'E-mail', detail: 'Resend: quote request notifications', on: Boolean(process.env.RESEND_API_KEY), icon: 'mail' as const },
    { name: 'Image uploads', detail: 'Cloudinary: product photos', on: Boolean(cloudinaryConfig()), icon: 'image' as const },
  ];
}

export default async function DashboardPage() {
  const [products, categories, text, inquiries] = await Promise.all([getAllProducts(), getCategories(), getCatalogText(), getInquiryCounts()]);
  const max = Math.max(...categories.map((c) => c.count));
  const stats: { label: string; value: number; icon: keyof typeof ICONS; href: string }[] = [
    { label: 'Products', value: products.length, icon: 'products', href: '/admin/products' },
    { label: 'Categories', value: categories.length, icon: 'categories', href: '/admin/categories' },
    { label: 'New quote requests', value: inquiries.new, icon: 'quotes', href: '/admin/quotes?status=new' },
    { label: 'Languages', value: routing.locales.length, icon: 'globe', href: '/admin/settings' },
  ];

  return (
    <>
      <PageHeader eyebrow="Overview" title="Dashboard" text="A quick look at the catalogue and what is connected.">
        <Link href="/admin/products/new" className={btnDark}>
          <Icon name="plus" className="h-4 w-4" /> Add product
        </Link>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="group rounded-[20px] border border-ink/10 bg-white p-5 transition-colors hover:border-ink/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-[0.12em] text-ink/50 uppercase">{s.label}</span>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-ink/[0.04] text-ink/60 transition-colors group-hover:bg-brand group-hover:text-white">
                <Icon name={s.icon} className="h-4 w-4" />
              </span>
            </div>
            <p className="display mt-3 text-5xl leading-none text-ink">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
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

        <Card>
          <CardTitle title="Connections" />
          <ul className="divide-y divide-ink/10">
            {integrations().map((i) => (
              <li key={i.name} className="flex items-center gap-3 px-5 py-4">
                <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-ink/[0.04] text-ink/70">
                  <Icon name={i.icon} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-ink">{i.name}</span>
                  <span className="block truncate text-xs text-ink/55">{i.detail}</span>
                </span>
                {i.on ? <Pill tone="green">Connected</Pill> : <Pill tone="amber">Not connected</Pill>}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-6">
        <CardTitle title="Latest products">
          <Link href="/admin/products" className={btnLight}>
            View all
          </Link>
        </CardTitle>
        <ul className="grid gap-px bg-ink/10 sm:grid-cols-2 lg:grid-cols-3">
          {products.slice(-6).reverse().map((p) => (
            <li key={p.slug} className="bg-white">
              <Link href={`/admin/products/${p.slug}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-ink/[0.02]">
                <span className="relative h-12 w-12 flex-none overflow-hidden rounded-xl bg-[#f3f3f3]">
                  {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="48px" className="object-cover mix-blend-multiply" />}
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-extrabold tracking-[0.12em] text-brand">{p.code}</span>
                  <span className="block truncate text-sm font-semibold text-ink">{text.productName(p)}</span>
                  <span className="block text-xs text-ink/50">{text.categoryName(p.category)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
