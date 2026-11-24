import type { Metadata } from 'next';
import { SettingsForm } from '@/components/admin/SettingsForm';
import { Card, CardTitle, Icon, PageHeader, Pill, StatCards } from '@/components/admin/ui';
import { SITE } from '@/config/site';
import { routing } from '@/i18n/routing';
import { requireAdmin } from '@/lib/admin/auth';
import { dbConfigured } from '@/lib/db/connect';
import { SOCIAL_KEYS, formatWhatsapp, getSite } from '@/lib/site';

export const metadata: Metadata = { title: 'Settings' };

const LANGUAGES: Record<string, string> = { en: 'English', de: 'Deutsch', no: 'Norsk', it: 'Italiano', fr: 'Français' };

const when = (iso?: string) =>
  iso ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Karachi' }).format(new Date(iso)) : 'never (built-in defaults)';

export default async function SettingsPage() {
  const [session, site] = await Promise.all([requireAdmin(), getSite()]);
  const db = dbConfigured();
  const mail = Boolean(process.env.RESEND_API_KEY && process.env.INQUIRY_TO_EMAIL);
  const socialCount = SOCIAL_KEYS.filter((k) => site.social[k]).length;

  return (
    <>
      <PageHeader eyebrow="Configuration" title="Settings" text="Company details used across the website, plus languages, connections and the admin account.">
        <a href="/en/contact" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-ink bg-white px-4 py-2.5 text-xs font-bold tracking-[0.08em] text-ink uppercase transition-colors hover:border-brand hover:text-brand">
          <Icon name="external" className="h-4 w-4" /> Contact page
        </a>
      </PageHeader>

      <StatCards
        items={[
          { label: 'Languages', value: routing.locales.length, icon: 'globe', hint: routing.locales.map((l) => l.toUpperCase()).join(' · ') },
          { label: 'Quote alerts', value: mail ? 'On' : 'Off', icon: 'mail', hint: mail ? `Sent to ${process.env.INQUIRY_TO_EMAIL}` : 'Not set up yet', alert: !mail },
          { label: 'Social profiles', value: `${socialCount}/${SOCIAL_KEYS.length}`, icon: 'external', hint: socialCount ? 'Shown in the footer' : 'Add links below' },
          { label: 'Founded', value: site.foundedYear, icon: 'dashboard', hint: `${new Date().getFullYear() - site.foundedYear} years in business` },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <SettingsForm site={site} dbReady={db} />

        <div className="space-y-6">
          {/* how visitors see it */}
          <Card>
            <CardTitle title="On the website now" />
            <div className="space-y-3.5 p-5 text-sm">
              <Row icon="mail" label="E-mail" value={site.email} />
              <Row icon="phone" label="Phone" value={site.phone} />
              <Row icon="chat" label="WhatsApp" value={formatWhatsapp(site.whatsapp)} />
              <Row icon="globe" label="Address" value={`${site.address.street}, ${site.address.city} ${site.address.postalCode}, ${site.address.country}`} />
              <Row icon="dashboard" label="Facts" value={`Since ${site.foundedYear} · ${site.stats.staff}+ staff · ${site.stats.clients}+ clients`} />
              <p className="border-t border-ink/10 pt-3 text-xs text-ink/60">Last saved: {when(site.updatedAt)}</p>
            </div>
          </Card>

          <Card>
            <CardTitle title="Languages" />
            <ul className="divide-y divide-ink/10">
              {routing.locales.map((l) => (
                <li key={l} className="flex items-center justify-between px-5 py-3 text-sm">
                  <a href={`/${l}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink hover:text-brand">
                    {LANGUAGES[l] ?? l} <span className="ml-1 text-xs font-bold text-ink/60 uppercase">/{l}</span>
                  </a>
                  <Pill tone={l === routing.defaultLocale ? 'red' : 'green'}>{l === routing.defaultLocale ? 'Default' : 'Live'}</Pill>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardTitle title="Admin account" />
            <div className="flex items-center gap-3 p-5">
              <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-ink text-sm font-bold text-white">{session.email[0]?.toUpperCase()}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink">{session.email}</p>
                <p className="text-xs text-ink/65">Administrator · {SITE.name}</p>
              </div>
            </div>
            <p className="border-t border-ink/10 px-5 py-3.5 text-xs leading-relaxed text-ink/65">
              To change the login e-mail or password, contact your website developer.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}

function Row({ icon, label, value }: { icon: 'mail' | 'phone' | 'chat' | 'globe' | 'dashboard'; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 grid h-8 w-8 flex-none place-items-center rounded-full bg-ink/[0.05] text-ink/70">
        <Icon name={icon} className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold tracking-[0.14em] text-ink/60 uppercase">{label}</p>
        <p className="break-words text-ink">{value}</p>
      </div>
    </div>
  );
}
