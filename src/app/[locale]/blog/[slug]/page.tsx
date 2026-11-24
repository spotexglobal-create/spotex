import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations } from 'next-intl/server';
import { SITE, whatsappLink } from '@/config/site';
import { getPost, getPosts } from '@/lib/blog';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { initLocale, type LocaleParams } from '@/i18n/server';
import { localeAlternates } from '@/lib/seo';

type Props = LocaleParams<{ slug: string }>;

export async function generateStaticParams() {
  const posts = await getPosts();
  return routing.locales.flatMap((locale) => posts.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: Props) {
  const { locale: raw, slug } = await params;
  const locale = initLocale(raw);
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: localeAlternates(locale, { pathname: '/blog/[slug]', params: { slug } }),
    openGraph: { type: 'article', images: [post.cover], publishedTime: post.date },
  };
}

export default async function PostPage({ params }: Props) {
  const { locale, slug } = await params;
  initLocale(locale);
  const post = await getPost(slug);
  if (!post) notFound();

  const [t, nav, common, format] = await Promise.all([
    getTranslations('BlogPage'),
    getTranslations('Nav'),
    getTranslations('Common'),
    getFormatter(),
  ]);
  const others = (await getPosts()).filter((p) => p.slug !== post.slug).slice(0, 2);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.cover,
    datePublished: post.date,
    inLanguage: 'en',
    publisher: { '@type': 'Organization', name: SITE.name },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="container-page pt-24 pb-20 md:pt-[104px]">
        <nav aria-label="Breadcrumb" className="text-[11px] font-bold tracking-[0.16em] uppercase">
          <ol className="flex flex-wrap items-center gap-2 text-ink/50">
            <li>
              <Link href="/" className="hover:text-brand">
                {nav('home')}
              </Link>
            </li>
            <li aria-hidden className="text-brand">/</li>
            <li>
              <Link href="/blog" className="hover:text-brand">
                {t('title')}
              </Link>
            </li>
          </ol>
        </nav>

        <header className="mt-6 max-w-3xl">
          <p className="text-[11px] font-bold tracking-[0.16em] text-brand uppercase">
            {t(`topics.${post.topic}`)} · {t('minRead', { n: post.minutes })} ·{' '}
            {format.dateTime(new Date(post.date), { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h1 className="display mt-3 text-[clamp(40px,5.4vw,80px)] leading-[0.92] text-ink" lang="en">
            {post.title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-ink/85" lang="en">
            {post.excerpt}
          </p>
          {locale !== 'en' && <p className="mt-3 text-xs font-semibold text-ink/45">{t('englishOnly')}</p>}
        </header>

        <div className="relative mt-10 aspect-[21/9] overflow-hidden rounded-[24px] border-[1.5px] border-ink/15 bg-soft">
          <Image src={post.cover} alt="" fill priority sizes="100vw" className="photo-multiply object-contain p-6" />
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* article body */}
          <div className="max-w-[680px] space-y-8" lang="en">
            {post.sections.map((s, i) => (
              <section key={i}>
                {s.heading && <h2 className="display text-[clamp(28px,2.6vw,38px)] leading-none text-ink">{s.heading}</h2>}
                {s.paragraphs.map((para) => (
                  <p key={para} className={`text-[16.5px] leading-[1.8] text-ink/85 ${s.heading ? 'mt-3' : ''} ${i === 0 ? 'first-letter:float-left first-letter:mr-2 first-letter:font-[family-name:var(--font-display)] first-letter:text-6xl first-letter:leading-[0.8] first-letter:text-brand' : ''}`}>
                    {para}
                  </p>
                ))}
                {s.points && (
                  <ul className="mt-4 space-y-2 rounded-2xl bg-soft p-5">
                    {s.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-3 text-[15px] font-semibold text-ink">
                        <svg viewBox="0 0 16 16" aria-hidden className="mt-1 h-3.5 w-3.5 flex-none fill-none stroke-brand stroke-[2.4]">
                          <path d="m3 8.5 3 3 7-7" />
                        </svg>
                        {pt}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          {/* side: next step */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[22px] bg-ink p-6 text-white">
              <p className="text-[11px] font-bold tracking-[0.2em] text-brand uppercase">{t('ctaEyebrow')}</p>
              <p className="display mt-2 text-3xl leading-none">{t('ctaTitle')}</p>
              <p className="mt-3 text-sm leading-relaxed text-white/70">{t('ctaText')}</p>
              <Link href="/contact" className="btn mt-5 w-full">
                {common('requestSample')}
              </Link>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="mt-3 block text-center text-xs font-bold text-white/70 hover:text-white">
                {common('whatsapp')} →
              </a>
            </div>
          </aside>
        </div>
      </article>

      {/* more articles */}
      {others.length > 0 && (
        <section className="border-t border-ink/10 bg-soft py-16">
          <div className="container-page">
            <div className="flex items-end justify-between gap-4">
              <h2 className="display text-4xl text-ink">{t('related')}</h2>
              <Link href="/blog" className="text-xs font-bold tracking-[0.14em] text-brand uppercase hover:underline">
                {t('backToBlog')} →
              </Link>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {others.map((p) => (
                <Link
                  key={p.slug}
                  href={{ pathname: '/blog/[slug]', params: { slug: p.slug } }}
                  className="group flex gap-4 rounded-[20px] border-[1.5px] border-ink bg-white p-3"
                >
                  <span className="relative aspect-square w-28 flex-none overflow-hidden rounded-2xl bg-soft">
                    <Image src={p.cover} alt="" fill sizes="112px" className="photo-multiply object-cover" />
                  </span>
                  <span className="py-1 pr-2">
                    <span className="text-[10.5px] font-bold tracking-[0.16em] text-brand uppercase">{t(`topics.${p.topic}`)}</span>
                    <span className="display mt-1 block text-xl leading-tight text-ink group-hover:text-brand">{p.title}</span>
                    <span className="mt-1 block text-xs text-ink/50">{t('minRead', { n: p.minutes })}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
