import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductsTable } from '@/components/admin/ProductsTable';
import { Icon, PageHeader, StatCards, btnDark } from '@/components/admin/ui';
import { getAllProducts, getCategories } from '@/lib/catalog';
import { getCatalogText } from '@/lib/catalog/text';
import { dbConfigured } from '@/lib/db/connect';

export const metadata: Metadata = { title: 'Products' };

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ category?: string; deleted?: string }> }) {
  const { category, deleted } = await searchParams;
  const [products, categories, text] = await Promise.all([getAllProducts(), getCategories(), getCatalogText()]);
  const hidden = products.filter((p) => p.visible === false).length;

  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title="Products"
        text={`${products.length} products in ${categories.length} categories${hidden ? `, ${hidden} hidden from the website` : ''}.`}
      >
        <Link href="/admin/products/new" className={btnDark}>
          <Icon name="plus" className="h-4 w-4" /> Add product
        </Link>
      </PageHeader>
      <StatCards
        items={[
          { label: 'All products', value: products.length, icon: 'products' },
          { label: 'Live on website', value: products.length - hidden, icon: 'eye' },
          { label: 'Hidden', value: hidden, icon: 'edit', hint: hidden ? 'Not shown to visitors' : 'Everything is live' },
          { label: 'Featured', value: products.filter((p) => p.featured).length, icon: 'image', hint: 'Category cover photos' },
        ]}
      />
      {deleted === '1' && (
        <p className="mb-5 rounded-2xl border border-emerald-600/25 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">Product deleted.</p>
      )}
      <ProductsTable
        dbReady={dbConfigured()}
        initialCategory={category ?? ''}
        categories={categories.map((c) => ({ slug: c.slug, name: text.categoryName(c.slug) }))}
        rows={products.map((p) => ({
          slug: p.slug,
          code: p.code,
          name: text.productName(p),
          category: p.category,
          categoryName: text.categoryName(p.category),
          summary: text.summary(p),
          image: p.images[0] ?? '',
          photos: p.images.length,
          featured: Boolean(p.featured),
          visible: p.visible !== false,
        }))}
      />
    </>
  );
}
