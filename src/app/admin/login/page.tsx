import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SITE } from '@/config/site';
import { getSession } from '@/lib/admin/auth';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = { title: 'Sign in' };

export default async function LoginPage() {
  if (await getSession()) redirect('/admin');

  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* brand side */}
      <section className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Image src={SITE.logo} alt={SITE.name} width={160} height={44} className="h-11 w-auto self-start rounded-md" priority />
        <div className="relative z-10 max-w-md">
          <p className="eyebrow">Admin portal</p>
          <h1 className="display mt-4 text-[clamp(56px,6vw,96px)]">
            Run the
            <br />
            <span className="text-brand">catalogue.</span>
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-white/70">
            Products, categories, quote requests and company details for the Spotex website, in one place.
          </p>
        </div>
        <p className="relative z-10 text-xs text-white/65">© {new Date().getFullYear()} {SITE.name}</p>
        <span
          aria-hidden
          className="display pointer-events-none absolute -right-10 -bottom-16 text-[340px] leading-none text-white/[0.04] select-none"
        >
          Spotex
        </span>
      </section>

      {/* form side */}
      <section className="flex items-center justify-center bg-white px-6 py-16">
        <div className="w-full max-w-[400px]">
          <Image src={SITE.logo} alt={SITE.name} width={130} height={36} className="mb-10 h-9 w-auto rounded-md lg:hidden" />
          <p className="text-[11px] font-bold tracking-[0.22em] text-brand uppercase">Restricted area</p>
          <h2 className="display mt-2 text-5xl text-ink">Sign in</h2>
          <p className="mt-2 text-sm text-ink/75">Use your admin e-mail and password.</p>
          <LoginForm />
          <Link href="/" className="mt-8 inline-block text-xs font-semibold text-ink/70 hover:text-brand">
            ← Back to the website
          </Link>
        </div>
      </section>
    </main>
  );
}
