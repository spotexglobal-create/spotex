import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductForm, type ProductFormOptions } from '@/components/admin/ProductForm';
import { PageHeader } from '@/components/admin/ui';
import { getAllProducts, getCategoryRecords } from '@/lib/catalog';
import { getCatalogText } from '@/lib/catalog/text';
import { PRODUCT_TYPES, SPEC_LABELS, type Product } from '@/lib/catalog/types';
import { dbConfigured } from '@/lib/db/connect';
import en from '@/messages/en.json';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ saved?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug === 'new' ? 'New product' : `Edit ${slug.toUpperCase()}` };
}

export default async function AdminProductPage({ params, searchParams }: Props) {
  const [{ slug }, { saved }] = await Promise.all([params, searchParams]);
  const [products, text, categories] = await Promise.all([getAllProducts(), getCatalogText(), getCategoryRecords()]);
  const product = slug === 'new' ? undefined : products.find((p) => p.slug === slug);
  if (slug !== 'new' && !product) notFound();

  // every choice is a translation key, so the form offers exactly what the website can show in all languages
  const options: ProductFormOptions = {
    categories: categories.map(({ slug: value }) => ({ value, label: text.categoryName(value) })),
    types: PRODUCT_TYPES.map((value) => ({ value, label: text.productName({ type: value } as Product) })),
    labels: SPEC_LABELS.map((value) => ({ value, label: text.specLabel({ label: value }) })),
    values: Object.entries(en.Catalog.values).map(([value, label]) => ({ value, label })),
  };

  return (
    <>
      <PageHeader
        back={{ href: '/admin/products', label: 'All products' }}
        eyebrow={product ? product.code : 'Catalogue'}
        title={product ? text.productName(product) : 'New product'}
        text={product ? text.categoryName(product.category) : 'Add a product to the catalogue.'}
      />
      <ProductForm
        key={product?.slug ?? 'new'}
        product={product}
        options={options}
        dbReady={dbConfigured()}
        saved={saved === '1'}
        preview={product && { name: text.productName(product), summary: text.summary(product) }}
      />
    </>
  );
}
