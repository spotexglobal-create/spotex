import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CategoryForm } from '@/components/admin/CategoryForm';
import { PageHeader } from '@/components/admin/ui';
import { getAdminCategories, isCategorySlug } from '@/lib/catalog';
import { CATEGORY_LOCALES, type CategoryLocale, type CategorySlug, type LocalizedText } from '@/lib/catalog/types';
import { dbConfigured } from '@/lib/db/connect';
import de from '@/messages/de.json';
import en from '@/messages/en.json';
import fr from '@/messages/fr.json';
import it from '@/messages/it.json';
import no from '@/messages/no.json';

const MESSAGES = { en, de, no, it, fr } as const;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: isCategorySlug(slug) ? `Edit ${en.Catalog.categories[slug].name}` : 'Category' };
}

/** The text the website shows now: the stored one, else the message file. */
function current(slug: CategorySlug, field: 'name' | 'intro', stored: LocalizedText) {
  const out = {} as Record<CategoryLocale, string>;
  for (const l of CATEGORY_LOCALES) out[l] = stored[l] || MESSAGES[l].Catalog.categories[slug][field];
  return out;
}

export default async function AdminCategoryPage({ params }: Props) {
  const { slug } = await params;
  if (!isCategorySlug(slug)) notFound();
  const all = await getAdminCategories();
  const category = all.find((c) => c.slug === slug);
  if (!category) notFound();
  const name = current(slug, 'name', category.name);

  return (
    <>
      <PageHeader
        back={{ href: '/admin/categories', label: 'All categories' }}
        eyebrow="Category"
        title={name.en}
        text={`${category.count} products · website address /products/${slug}`}
      />
      <CategoryForm
        key={slug}
        dbReady={dbConfigured()}
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
