import { unstable_cache } from 'next/cache';
import { SITE } from '@/config/site';
import { connectDb, dbConfigured } from '@/lib/db/connect';
import { SettingsModel } from '@/lib/db/models';

/**
 * Company details for the website: the record saved in admin → Settings, with src/config/site.ts
 * as the fallback for anything empty (and for everything when there is no database).
 * Saving in admin calls revalidateTag(SETTINGS_TAG), so every page picks the change up.
 */

export const SETTINGS_TAG = 'settings';

export const SOCIAL_KEYS = ['facebook', 'instagram', 'linkedin', 'youtube', 'tiktok'] as const;
export type SocialKey = (typeof SOCIAL_KEYS)[number];

export interface SiteInfo {
  email: string;
  phone: string;
  /** Digits only, with country code, e.g. 923009648142. */
  whatsapp: string;
  address: { street: string; city: string; postalCode: string; country: string };
  foundedYear: number;
  stats: { staff: number; clients: number; departments: number };
  /** Profile URLs; only filled ones show in the footer. */
  social: Partial<Record<SocialKey, string>>;
  updatedAt?: string;
}

export const DEFAULT_SITE: SiteInfo = {
  email: SITE.email,
  phone: SITE.phone,
  whatsapp: SITE.whatsapp,
  address: { ...SITE.address },
  foundedYear: SITE.foundedYear,
  stats: { ...SITE.stats },
  social: { ...SITE.social },
};

const load = unstable_cache(
  async (): Promise<SiteInfo> => {
    await connectDb();
    const d = await SettingsModel.findOne({ key: 'site' }).lean();
    if (!d) return DEFAULT_SITE;
    const pick = <T,>(v: T | null | undefined, fallback: T) => (v === null || v === undefined || v === '' ? fallback : v);
    // social links saved in admin replace the defaults as a set; with none saved, the official profiles show
    const social: SiteInfo['social'] = Object.fromEntries(SOCIAL_KEYS.flatMap((k) => (d.social?.[k] ? [[k, d.social[k]]] : [])));
    return {
      email: pick(d.email, DEFAULT_SITE.email),
      phone: pick(d.phone, DEFAULT_SITE.phone),
      whatsapp: pick(d.whatsapp, DEFAULT_SITE.whatsapp),
      address: {
        street: pick(d.street, DEFAULT_SITE.address.street),
        city: pick(d.city, DEFAULT_SITE.address.city),
        postalCode: pick(d.postalCode, DEFAULT_SITE.address.postalCode),
        country: pick(d.country, DEFAULT_SITE.address.country),
      },
      foundedYear: pick(d.foundedYear, DEFAULT_SITE.foundedYear),
      stats: {
        staff: pick(d.staff, DEFAULT_SITE.stats.staff),
        clients: pick(d.clients, DEFAULT_SITE.stats.clients),
        departments: DEFAULT_SITE.stats.departments,
      },
      social: Object.keys(social).length ? social : DEFAULT_SITE.social,
      updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : undefined,
    };
  },
  ['site-settings'],
  { tags: [SETTINGS_TAG], revalidate: 3600 },
);

export async function getSite(): Promise<SiteInfo> {
  if (!dbConfigured()) return DEFAULT_SITE;
  try {
    return await load();
  } catch {
    return DEFAULT_SITE; // never take the website down over settings
  }
}

/** "923009648142" → "+92 300 9648142" */
export const formatWhatsapp = (digits: string) => `+${digits.replace(/^(\d{2})(\d{3})(\d+)/, '$1 $2 $3')}`;
