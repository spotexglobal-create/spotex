import type { Metadata } from 'next';
import { Card, CardTitle, PageHeader, Pill, ReadOnlyNotice, btnDark, field, fieldLabel } from '@/components/admin/ui';
import { SITE } from '@/config/site';
import { routing } from '@/i18n/routing';
import { requireAdmin } from '@/lib/admin/auth';

export const metadata: Metadata = { title: 'Settings' };

const LANGUAGES: Record<string, string> = { en: 'English', de: 'Deutsch', no: 'Norsk', it: 'Italiano', fr: 'Français' };

export default async function SettingsPage() {
  const session = await requireAdmin();
  const company = [
    { label: 'Company name', value: SITE.name },
    { label: 'E-mail', value: SITE.email },
    { label: 'Phone', value: SITE.phone },
    { label: 'WhatsApp number', value: `+${SITE.whatsapp}` },
    { label: 'Street', value: SITE.address.street },
    { label: 'City', value: `${SITE.address.city} ${SITE.address.postalCode}` },
    { label: 'Country', value: SITE.address.country },
    { label: 'Founded', value: String(SITE.foundedYear) },
  ];

  return (
    <>
      <PageHeader eyebrow="Configuration" title="Settings" text="Company details shown across the website, languages and the admin account." />
      <ReadOnlyNotice />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardTitle title="Company details" />
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            {company.map((f) => (
              <label key={f.label}>
                <span className={fieldLabel}>{f.label}</span>
                <input className={field} defaultValue={f.value} disabled />
              </label>
            ))}
          </div>
          <div className="flex justify-end border-t border-ink/10 px-5 py-4">
            <button type="button" className={btnDark} disabled>
              Save changes
            </button>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardTitle title="Languages" />
            <ul className="divide-y divide-ink/10">
              {routing.locales.map((l) => (
                <li key={l} className="flex items-center justify-between px-5 py-3 text-sm">
                  <span className="font-semibold text-ink">
                    {LANGUAGES[l] ?? l} <span className="ml-1 text-xs font-bold text-ink/40 uppercase">{l}</span>
                  </span>
                  <Pill tone={l === routing.defaultLocale ? 'red' : 'green'}>{l === routing.defaultLocale ? 'Default' : 'Live'}</Pill>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardTitle title="Admin account" />
            <div className="space-y-2 p-5 text-sm">
              <p className="font-semibold text-ink">{session.email}</p>
              <p className="text-xs leading-relaxed text-ink/55">
                The login is set with the ADMIN_EMAIL and ADMIN_PASSWORD environment variables. To change the password, update ADMIN_PASSWORD in
                Vercel and redeploy.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
