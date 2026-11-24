import type { ReactNode } from 'react';
import { Sidebar } from '@/components/admin/Sidebar';
import { requireAdmin } from '@/lib/admin/auth';
import { getInquiryCounts } from '@/lib/admin/inquiries';
import { getAllPosts } from '@/lib/blog';
import { getAllProducts, getCategories } from '@/lib/catalog';

/** Every admin page below this layout needs a signed-in admin. */
export default async function PanelLayout({ children }: { children: ReactNode }) {
  const session = await requireAdmin();
  const [products, categories, inquiries, posts] = await Promise.all([getAllProducts(), getCategories(), getInquiryCounts(), getAllPosts()]);

  return (
    <div className="lg:flex">
      <Sidebar
        email={session.email}
        counts={{ '/admin/products': products.length, '/admin/categories': categories.length, '/admin/quotes': inquiries.new, '/admin/blog': posts.length }}
      />
      <main className="min-w-0 flex-1 px-5 py-8 md:px-10 md:py-10">
        <div className="mx-auto max-w-[1200px]">{children}</div>
      </main>
    </div>
  );
}
