'use client';

import { type FormEvent, type ReactNode, useActionState, useTransition } from 'react';
import { saveSettings, type SettingsFormState } from '@/app/admin/settings-actions';
import type { SiteInfo, SocialKey } from '@/lib/site';
import { Card, CardTitle, Icon, btnDark, field, fieldLabel, type ICONS } from './ui';

const SOCIAL: [SocialKey, string, string][] = [
  ['facebook', 'Facebook', 'https://facebook.com/…'],
  ['instagram', 'Instagram', 'https://instagram.com/…'],
  ['linkedin', 'LinkedIn', 'https://linkedin.com/company/…'],
  ['youtube', 'YouTube', 'https://youtube.com/@…'],
  ['tiktok', 'TikTok', 'https://tiktok.com/@…'],
];

/** Company details editor (admin → Settings). The website updates within seconds of saving. */
export function SettingsForm({ site, dbReady }: { site: SiteInfo; dbReady: boolean }) {
  const [state, action, saving] = useActionState<SettingsFormState, FormData>(saveSettings, {});
  const [, start] = useTransition();
  const bad = (name: string) => (state.fields?.includes(name) ? '!border-brand' : '');
  const disabled = !dbReady || saving;

  // a transition instead of <form action>, so typed values stay when the server returns an error
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    start(() => action(data));
  };

  const input = (name: string, label: string, value: string | number, opts: { type?: string; hint?: string; wide?: boolean; placeholder?: string } = {}) => (
    <label className={opts.wide ? 'sm:col-span-2' : ''}>
      <span className={fieldLabel}>{label}</span>
      <input name={name} type={opts.type ?? 'text'} defaultValue={value} placeholder={opts.placeholder} className={`${field} ${bad(name)}`} disabled={disabled} required />
      {opts.hint && <span className="mt-1 block text-xs text-ink/60">{opts.hint}</span>}
    </label>
  );

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {state.error && (
        <p role="alert" className="rounded-2xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm font-semibold text-brand">
          {state.error}
        </p>
      )}
      {state.saved && !saving && (
        <p className="rounded-2xl border border-emerald-600/25 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          Saved. The website shows the new details within a few seconds.
        </p>
      )}

      <Section icon="mail" title="Contact" text="Shown in the footer, on the contact page and on every WhatsApp button.">
        {input('email', 'Public e-mail', site.email, { type: 'email', placeholder: 'inquiry@spotexinternational.com' })}
        {input('phone', 'Phone', site.phone, { placeholder: '+92 55 320 33 33' })}
        {input('whatsapp', 'WhatsApp number', `+${site.whatsapp}`, { hint: 'With country code, e.g. +92 300 9648142', placeholder: '+92 300 9648142' })}
      </Section>

      <Section icon="globe" title="Address" text="The factory address in the footer and on the contact page.">
        {input('street', 'Street', site.address.street, { wide: true })}
        {input('city', 'City', site.address.city)}
        {input('postalCode', 'Postal code', site.address.postalCode)}
        {input('country', 'Country', site.address.country)}
      </Section>

      <Section icon="dashboard" title="Company facts" text="The numbers on the home page, About and Factory pages.">
        {input('foundedYear', 'Founded (year)', site.foundedYear, { type: 'number' })}
        {input('staff', 'Staff', site.stats.staff, { type: 'number', hint: 'Shown as “50+”' })}
        {input('clients', 'Clients', site.stats.clients, { type: 'number', hint: 'Shown as “100+”' })}
      </Section>

      <Section icon="external" title="Social media" text="Full profile links (https://…). Each filled link shows as an icon in the website footer; leave empty to hide.">
        {SOCIAL.map(([k, label, ph]) => (
          <label key={k}>
            <span className={fieldLabel}>{label}</span>
            <input
              name={`social_${k}`}
              type="url"
              defaultValue={site.social[k] ?? ''}
              placeholder={ph}
              className={`${field} ${bad(`social_${k}`)}`}
              disabled={disabled}
            />
          </label>
        ))}
      </Section>

      <div className="sticky bottom-4 z-10 flex items-center justify-between gap-4 rounded-2xl border border-ink bg-white px-5 py-3.5 shadow-[0_10px_30px_rgba(0,0,0,.08)]">
        <p className="text-xs text-ink/70">{dbReady ? 'Changes go live on the website after saving.' : 'Saving is not available right now.'}</p>
        <button type="submit" className={btnDark} disabled={disabled}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}

function Section({ icon, title, text, children }: { icon: keyof typeof ICONS; title: string; text: string; children: ReactNode }) {
  return (
    <Card>
      <CardTitle title={title}>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-ink/[0.05] text-ink/70">
          <Icon name={icon} className="h-4 w-4" />
        </span>
      </CardTitle>
      <p className="px-5 pt-4 text-xs text-ink/65">{text}</p>
      <div className="grid gap-4 p-5 pt-3 sm:grid-cols-2">{children}</div>
    </Card>
  );
}
