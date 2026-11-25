import type { MetadataRoute } from 'next';
import { DEPARTMENTS } from '@/data/departments';
import { getPathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { getCategories, getProducts } from '@/lib/catalog';
import { getPosts } from '@/lib/blog';
import { SITE_URL } from '@/lib/seo';

type Href = Parameters<typeof getPathname>[0]['href'];

/** Rebuilt at most once an hour, so new products and articles show up without a deploy. */
export const revalidate = 3600;

/**
 * /sitemap.xml for search engines: every public page in all five languages, each entry listing its
 * translations (hreflang), the same way the pages themselves do. Admin pages are never listed.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products, posts] = await Promise.all([getCategories(), getProducts(), getPosts()]);
  const now = new Date();

  const pages: { href: Href; priority: number; changeFrequency: 'weekly' | 'monthly'; lastModified?: Date }[] = [
    { href: '/', priority: 1, changeFrequency: 'weekly' },
    { href: '/products', priority: 0.9, changeFrequency: 'weekly' },
    { href: '/private-label', priority: 0.8, changeFrequency: 'monthly' },
    { href: '/factory', priority: 0.7, changeFrequency: 'monthly' },
    { href: '/about', priority: 0.6, changeFrequency: 'monthly' },
    { href: '/contact', priority: 0.7, changeFrequency: 'monthly' },
    { href: '/blog', priority: 0.6, changeFrequency: 'weekly' },
    ...categories.map((c) => ({
      href: { pathname: '/products/[category]', params: { category: c.slug } } as const,
      priority: 0.8,
      changeFrequency: 'weekly' as const,
    })),
    ...products.map((p) => ({
      href: { pathname: '/products/[category]/[product]', params: { category: p.category, product: p.slug } } as const,
      priority: 0.7,
      changeFrequency: 'monthly' as const,
    })),
    ...DEPARTMENTS.map((d) => ({
      href: { pathname: '/factory/[department]', params: { department: d.key } } as const,
      priority: 0.5,
      changeFrequency: 'monthly' as const,
    })),
    ...posts.map((p) => ({
      href: { pathname: '/blog/[slug]', params: { slug: p.slug } } as const,
      priority: 0.6,
      changeFrequency: 'monthly' as const,
      lastModified: new Date(p.date),
    })),
  ];

  return pages.flatMap(({ href, priority, changeFrequency, lastModified }) => {
    const languages: Record<string, string> = {};
    for (const l of routing.locales) languages[l] = SITE_URL + getPathname({ locale: l, href });
    languages['x-default'] = languages[routing.defaultLocale];
    return routing.locales.map((locale) => ({
      url: languages[locale],
      lastModified: lastModified ?? now,
      changeFrequency,
      priority,
      alternates: { languages },
    }));
  });
}
