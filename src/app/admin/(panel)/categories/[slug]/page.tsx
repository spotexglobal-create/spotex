import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CategoryForm } from '@/components/admin/CategoryForm';
import { PageHeader } from '@/components/admin/ui';
import { getAdminCategories } from '@/lib/catalog';
import { CATEGORY_LOCALES, type CategoryLocale, type LocalizedText } from '@/lib/catalog/types';
import { dbConfigured } from '@/lib/db/connect';
import de from '@/messages/de.json';
import en from '@/messages/en.json';
import fr from '@/messages/fr.json';
import it from '@/messages/it.json';
import no from '@/messages/no.json';

type BuiltIn = Record<string, { name: string; intro: string } | undefined>;
const MESSAGES: Record<CategoryLocale, BuiltIn> = {
  en: en.Catalog.categories,
  de: de.Catalog.categories,
  no: no.Catalog.categories,
  it: it.Catalog.categories,
  fr: fr.Catalog.categories,
};

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ created?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (slug === 'new') return { title: 'New category' };
  const category = (await getAdminCategories()).find((c) => c.slug === slug);
  return { title: `Edit ${category?.name.en || MESSAGES.en[slug]?.name || slug}` };
}

/** The text the website shows now: the stored one, else the built-in translation (none for new categories). */
function current(slug: string, field: 'name' | 'intro', stored: LocalizedText) {
  const out = {} as Record<CategoryLocale, string>;
  for (const l of CATEGORY_LOCALES) out[l] = stored[l] || MESSAGES[l][slug]?.[field] || '';
  return out;
}

const EMPTY = { en: '', de: '', no: '', it: '', fr: '' };

export default async function AdminCategoryPage({ params, searchParams }: Props) {
  const [{ slug }, { created }] = await Promise.all([params, searchParams]);
  const all = await getAdminCategories();

  if (slug === 'new') {
    const last = Math.max(0, ...all.map((c) => c.order));
    return (
      <>
        <PageHeader
          back={{ href: '/admin/categories', label: 'All categories' }}
          eyebrow="Catalogue"
          title="New category"
          text="Give it a name and a short description. Only English is required: empty languages show the English text."
        />
        <CategoryForm
          dbReady={dbConfigured()}
          category={{ slug: '', name: EMPTY, intro: EMPTY, cover: '', autoCover: '', visible: true, order: last + 10, count: 0, isNew: true }}
        />
      </>
    );
  }

  const category = all.find((c) => c.slug === slug);
  if (!category) notFound();
  const name = current(slug, 'name', category.name);

  return (
    <>
      <PageHeader
        back={{ href: '/admin/categories', label: 'All categories' }}
        eyebrow="Category"
        title={name.en || slug}
        text={`${category.count} products · website address /products/${slug}`}
      />
      <CategoryForm
        key={slug}
        dbReady={dbConfigured()}
        created={created === '1'}
        category={{
          slug,
          name,
          intro: current(slug, 'intro', category.intro),
          cover: category.cover,
          autoCover: category.coverInUse && !category.cover ? category.coverInUse : '',
          visible: category.visible,
          order: category.order,
          count: category.count,
        }}
      />
    </>
  );
}
