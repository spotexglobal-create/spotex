'use server';

import { SITE } from '@/config/site';
import { routing } from '@/i18n/routing';
import { connectDb, dbConfigured } from '@/lib/db/connect';
import { InquiryModel } from '@/lib/db/models';

export interface InquiryState {
  status: 'idle' | 'sent' | 'offline' | 'invalid';
  /** Field names that failed validation. */
  errors?: string[];
  /** Plain-text summary, used for the WhatsApp fallback when e-mail is not connected yet. */
  summary?: string;
}

const clean = (v: FormDataEntryValue | null, max = 2000) => String(v ?? '').trim().slice(0, max);
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

/** At most this many requests per e-mail address per hour are stored (stops one sender flooding the inbox). */
const PER_HOUR = 5;

/** Saves the request to MongoDB (admin → Quote requests). Returns its id, or null when there is no database or it failed. */
async function store(kind: 'quote' | 'message', data: Record<string, unknown> & { email: string }, locale: string) {
  if (!dbConfigured()) return null;
  try {
    await connectDb();
    const recent = await InquiryModel.countDocuments({ email: data.email, createdAt: { $gt: new Date(Date.now() - 3600_000) } });
    if (recent >= PER_HOUR) return 'limited' as const;
    const doc = await InquiryModel.create({ kind, ...data, locale });
    return doc._id;
  } catch (err) {
    console.error('Could not save inquiry', err);
    return null;
  }
}

/**
 * Quote requests and simple messages from the contact page. Each one is saved to the database (admin inbox)
 * and e-mailed to the sales inbox through Resend (RESEND_API_KEY + INQUIRY_TO_EMAIL). If neither works,
 * the visitor gets a ready-made WhatsApp message instead, so no request is silently lost.
 */
export async function sendInquiry(_: InquiryState, form: FormData): Promise<InquiryState> {
  // bots fill the hidden field; pretend it worked
  if (clean(form.get('website'))) return { status: 'sent' };

  const kind = clean(form.get('kind'), 20) === 'quote' ? 'quote' : 'message';
  const data = {
    name: clean(form.get('name'), 120),
    email: clean(form.get('email'), 200),
    company: clean(form.get('company'), 160),
    phone: clean(form.get('phone'), 60),
    country: clean(form.get('country'), 80),
    products: form.getAll('products').map((p) => clean(p, 60)).filter(Boolean).slice(0, 12),
    quantity: clean(form.get('quantity'), 40),
    sample: form.get('sample') === 'on',
    branding: clean(form.get('branding'), 60),
    product: clean(form.get('product'), 60),
    message: clean(form.get('message'), 4000),
  };

  const errors: string[] = [];
  if (!data.name) errors.push('name');
  if (!isEmail(data.email)) errors.push('email');
  if (kind === 'message' && data.message.length < 5) errors.push('message');
  if (kind === 'quote' && !data.products.length && !data.product) errors.push('products');
  if (errors.length) return { status: 'invalid', errors };

  const lines = [
    kind === 'quote' ? 'New quote request' : 'New message',
    `Name: ${data.name}`,
    `E-mail: ${data.email}`,
    data.company && `Company: ${data.company}`,
    data.phone && `Phone / WhatsApp: ${data.phone}`,
    data.country && `Country: ${data.country}`,
    data.product && `Product code: ${data.product}`,
    data.products.length > 0 && `Products: ${data.products.join(', ')}`,
    data.quantity && `Quantity: ${data.quantity}`,
    kind === 'quote' && `Sample first: ${data.sample ? 'yes' : 'no'}`,
    data.branding && `Branding: ${data.branding}`,
    data.message && `\n${data.message}`,
  ].filter(Boolean) as string[];
  const summary = lines.join('\n');

  const rawLocale = clean(form.get('locale'), 5);
  const locale = (routing.locales as readonly string[]).includes(rawLocale) ? rawLocale : routing.defaultLocale;
  const id = await store(kind, data, locale);
  // a flood from one address: don't store or e-mail it again, offer WhatsApp instead
  if (id === 'limited') return { status: 'offline', summary };

  const key = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_TO_EMAIL;
  if (!key || !to) return id ? { status: 'sent' } : { status: 'offline', summary };

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.INQUIRY_FROM_EMAIL ?? `${SITE.name} <onboarding@resend.dev>`,
      to: [to],
      reply_to: data.email,
      subject: `${kind === 'quote' ? 'Quote request' : 'Message'} from ${data.name}${data.company ? ` (${data.company})` : ''}`,
      text: summary,
    }),
  }).catch(() => null);

  if (res?.ok && id) await InquiryModel.updateOne({ _id: id }, { $set: { emailed: true } }).catch(() => null);
  // stored in the inbox counts as received even if the e-mail failed
  return res?.ok || id ? { status: 'sent' } : { status: 'offline', summary };
}
