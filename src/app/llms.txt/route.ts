import { getPathname } from '@/i18n/navigation';
import { getCategories, getCategoryRecords, getProducts } from '@/lib/catalog';
import type { Product, Spec } from '@/lib/catalog/types';
import { getPosts } from '@/lib/blog';
import { SITE_URL } from '@/lib/seo';
import { getSite } from '@/lib/site';
import en from '@/messages/en.json';

/** Rebuilt at most once an hour, so new products and articles appear without a deploy. */
export const revalidate = 3600;

type Href = Parameters<typeof getPathname>[0]['href'];
const url = (href: Href) => SITE_URL + getPathname({ locale: 'en', href });

const C = en.Catalog;
const specText = (s: Spec) => (s.value ? C.values[s.value] : `${s.amount ?? ''} ${(s.unit ?? 'gsm').toUpperCase()}`);
/** Built-in English category texts (categories added in the admin have none). */
const BUILT_IN = C.categories as Record<string, { name: string; intro: string } | undefined>;

/**
 * /llms.txt (https://llmstxt.org): a plain Markdown summary of the company and its key pages for AI
 * assistants (ChatGPT, Claude, Gemini, Perplexity …), so they describe Spotex correctly and link to the
 * right pages. English only; every page also exists in German, Norwegian, Italian and French.
 */
export async function GET() {
  const [site, categories, records, products, posts] = await Promise.all([getSite(), getCategories(), getCategoryRecords(), getProducts(), getPosts()]);
  const stored = new Map(records.map((r) => [r.slug, r]));
  const catName = (slug: string) => stored.get(slug)?.name.en || BUILT_IN[slug]?.name || slug;
  const catIntro = (slug: string) => stored.get(slug)?.intro.en || BUILT_IN[slug]?.intro || '';
  const typeName = (p: Product) => (p.type === 'general' ? catName(p.category) : C.types[p.type]);
  const productName = (p: Product) => (p.line ? `${typeName(p)} ${p.line}` : typeName(p));
  const F = en.FactoryPage;
  const dept = en.Departments;

  const lines = [
    '# Spotex International',
    '',
    `> Martial arts uniform manufacturer and exporter with its own factory in ${site.address.city}, ${site.address.country}, since ${site.foundedYear}. BJJ gis, judo uniforms, rash guards, MMA shorts, gi bags and BJJ belts, made to order and private-labelled for academies, clubs and brands in the USA and Europe.`,
    '',
    '## Key facts',
    '',
    `- Own factory since ${site.foundedYear} in ${site.address.city}, ${site.address.country}, with ${site.stats.departments} in-house departments (design, pattern making, fabric weaving, knitting, dyeing, cutting, printing, stitching, inspection, packing) and ${site.stats.staff}+ staff.`,
    '- Capacity: 12,000 to 15,000 uniforms a month, more for large orders. 30 looms; 56 single-needle machines plus three-needle, bartack, overlock and Kansai waistband machines.',
    '- Minimum order: 30 pieces. Samples are usually ready in 7 to 10 days; bulk lead time depends on product and quantity.',
    '- BJJ gis from 280 to 550 GSM in all IBJJF-approved colours; judo gis in 450, 550 and 750 GSM (white, blue, black, pink).',
    '- Gi weaves: pearl, pearl plus, gold, all-play, honeycomb, diamond, chess, hemp and bamboo cotton. Pants in ripstop, cotton twill or baby canvas (8 to 12 oz).',
    '- Branding: embroidery, woven patches and labels, screen printing, DTF printing, digital printing and full sublimation.',
    '- ISO 9001 certified since 2014; official supplier of ju-jitsu uniforms and equipment to the Pakistan Ju-Jitsu Federation; registered exporter with the Federal Board of Revenue of Pakistan since 2002.',
    `- Exports to the United States, Germany, Norway, France, Italy and South Korea.`,
    `- Website languages: English, German, Norwegian, Italian, French.`,
    '',
    '## Contact',
    '',
    `- Email: ${site.email}`,
    `- Phone / WhatsApp: ${site.phone} (https://wa.me/${site.whatsapp})`,
    `- Address: ${site.address.street}, ${site.address.city} ${site.address.postalCode}, ${site.address.country}`,
    '- Office hours: Saturday to Thursday, 9:00 to 18:00 Pakistan time (UTC+5); closed on Fridays.',
    `- Quote and sample requests: ${url('/contact')}`,
    ...Object.entries(site.social).map(([k, href]) => `- ${k[0].toUpperCase() + k.slice(1)}: ${href}`),
    '',
    '## Main pages',
    '',
    `- [Home](${url('/')}): overview of the factory, products and custom branding`,
    `- [Products](${url('/products')}): the full catalogue by category`,
    `- [Custom uniforms / private label](${url('/private-label')}): how ordering under your own brand works`,
    `- [Factory](${url('/factory')}): ${F.metaDescription}`,
    `- [About](${url('/about')}): company history and who we work with`,
    `- [Contact](${url('/contact')}): request a quote or a sample`,
    `- [Blog](${url('/blog')}): guides on fabrics, weights and private label production`,
    '',
    '## Product categories',
    '',
    ...categories.map((c) => `- [${catName(c.slug)}](${url({ pathname: '/products/[category]', params: { category: c.slug } })}): ${catIntro(c.slug)}`),
    '',
    '## Factory departments',
    '',
    ...(Object.keys(dept) as (keyof typeof dept)[]).map(
      (k) => `- [${dept[k].name}](${url({ pathname: '/factory/[department]', params: { department: k } })}): ${dept[k].text}`,
    ),
    '',
    ...(posts.length
      ? ['## Articles', '', ...posts.map((p) => `- [${p.title}](${url({ pathname: '/blog/[slug]', params: { slug: p.slug } })}): ${p.excerpt}`), '']
      : []),
    '## Optional',
    '',
    ...products.map(
      (p) =>
        `- [${productName(p)} ${p.code}](${url({ pathname: '/products/[category]/[product]', params: { category: p.category, product: p.slug } })}): ${catName(p.category)}; ${p.specs.map(specText).join(', ')}`,
    ),
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
