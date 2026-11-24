'use server';

import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';
import { connectDb, dbConfigured } from '@/lib/db/connect';
import { SettingsModel } from '@/lib/db/models';
import { SETTINGS_TAG, SOCIAL_KEYS } from '@/lib/site';

export interface SettingsFormState {
  error?: string;
  saved?: boolean;
  /** Names of fields with a problem, highlighted in the form. */
  fields?: string[];
}

const str = (form: FormData, name: string, max = 160) => String(form.get(name) ?? '').trim().slice(0, max);

/** Saves the company details shown on the website (footer, contact page, about, factory, WhatsApp buttons). */
export async function saveSettings(_: SettingsFormState, form: FormData): Promise<SettingsFormState> {
  await requireAdmin();
  if (!dbConfigured()) return { error: 'Saving is not available right now, so the settings were not saved.' };

  const email = str(form, 'email').toLowerCase();
  const phone = str(form, 'phone', 40);
  const whatsapp = str(form, 'whatsapp', 40).replace(/\D/g, '');
  const street = str(form, 'street');
  const city = str(form, 'city', 80);
  const postalCode = str(form, 'postalCode', 20);
  const country = str(form, 'country', 80);
  const year = Number(str(form, 'foundedYear', 4));
  const staff = Number(str(form, 'staff', 6));
  const clients = Number(str(form, 'clients', 6));

  const fields: string[] = [];
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fields.push('email');
  if (!/^\+?[\d\s()-]{7,}$/.test(phone)) fields.push('phone');
  if (whatsapp.length < 10 || whatsapp.length > 15) fields.push('whatsapp');
  if (!street) fields.push('street');
  if (!city) fields.push('city');
  if (!country) fields.push('country');
  if (!Number.isInteger(year) || year < 1900 || year > new Date().getFullYear()) fields.push('foundedYear');
  if (!Number.isInteger(staff) || staff < 1) fields.push('staff');
  if (!Number.isInteger(clients) || clients < 1) fields.push('clients');
  const social: Record<string, string> = {};
  for (const k of SOCIAL_KEYS) {
    const url = str(form, `social_${k}`, 300);
    if (!url) continue;
    if (/^https:\/\/[^\s"'<>]+\.[^\s"'<>]+$/.test(url)) social[k] = url;
    else fields.push(`social_${k}`);
  }
  if (fields.length) return { error: 'Please check the highlighted fields.', fields };

  await connectDb();
  await SettingsModel.updateOne(
    { key: 'site' },
    { $set: { email, phone, whatsapp, street, city, postalCode, country, foundedYear: year, staff, clients, social } },
    { upsert: true },
  );
  revalidateTag(SETTINGS_TAG);
  return { saved: true };
}
