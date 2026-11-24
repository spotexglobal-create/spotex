import { isValidObjectId } from 'mongoose';
import { connectDb, dbConfigured } from '@/lib/db/connect';
import { INQUIRY_STATUSES, InquiryModel, type InquiryStatus } from '@/lib/db/models';

/** Quote requests and messages for the admin inbox (server only). */

export interface Inquiry {
  id: string;
  kind: 'quote' | 'message';
  name: string;
  email: string;
  company?: string;
  phone?: string;
  country?: string;
  products: string[];
  product?: string;
  quantity?: string;
  sample?: boolean;
  branding?: string;
  message?: string;
  locale?: string;
  status: InquiryStatus;
  note?: string;
  emailed: boolean;
  createdAt: string;
}

export const isInquiryStatus = (v: string | undefined): v is InquiryStatus => (INQUIRY_STATUSES as readonly string[]).includes(v ?? '');

/** "quote" = the quote form, "message" = the general message form. */
export type InquiryKind = 'quote' | 'message';

/** Count per status plus "all", for one form or both. Zeroes without a database. */
export async function getInquiryCounts(kind?: InquiryKind): Promise<Record<InquiryStatus | 'all', number>> {
  const counts = Object.fromEntries([...INQUIRY_STATUSES, 'all'].map((s) => [s, 0])) as Record<InquiryStatus | 'all', number>;
  if (!dbConfigured()) return counts;
  await connectDb();
  const rows = await InquiryModel.aggregate<{ _id: InquiryStatus; n: number }>([
    ...(kind ? [{ $match: { kind } }] : []),
    { $group: { _id: '$status', n: { $sum: 1 } } },
  ]);
  for (const r of rows) {
    counts[r._id] = r.n;
    counts.all += r.n;
  }
  return counts;
}

const TZ = 'Asia/Karachi';
const dayKey = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: TZ }); // yyyy-mm-dd

/** Requests per day for the last `days` days (oldest first, Pakistan time). Zeroes without a database. */
export async function getInquiriesPerDay(days = 30, kind?: InquiryKind): Promise<{ date: string; count: number }[]> {
  const now = Date.now();
  const series = Array.from({ length: days }, (_, i) => ({ date: dayKey(new Date(now - (days - 1 - i) * 86_400_000)), count: 0 }));
  if (!dbConfigured()) return series;
  await connectDb();
  const rows = await InquiryModel.aggregate<{ _id: string; n: number }>([
    { $match: { createdAt: { $gte: new Date(now - days * 86_400_000) }, ...(kind ? { kind } : {}) } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: TZ } }, n: { $sum: 1 } } },
  ]);
  const byDay = new Map(rows.map((r) => [r._id, r.n]));
  return series.map((s) => ({ ...s, count: byDay.get(s.date) ?? 0 }));
}

export const INQUIRIES_PER_PAGE = 25;

/** Newest first, optionally one status and one form, one page at a time. */
export async function getInquiries(status?: InquiryStatus, page = 1, kind?: InquiryKind): Promise<Inquiry[]> {
  if (!dbConfigured()) return [];
  await connectDb();
  const docs = await InquiryModel.find({ ...(status ? { status } : {}), ...(kind ? { kind } : {}) })
    .sort({ createdAt: -1 })
    .skip((page - 1) * INQUIRIES_PER_PAGE)
    .limit(INQUIRIES_PER_PAGE)
    .lean();
  return docs.map(toInquiry);
}

/** One request by id, or null. */
export async function getInquiry(id: string): Promise<Inquiry | null> {
  if (!dbConfigured() || !isValidObjectId(id)) return null;
  await connectDb();
  const doc = await findLean(id);
  return doc ? toInquiry(doc) : null;
}

const findLean = (id: string) => InquiryModel.findById(id).lean();
type InquiryDoc = NonNullable<Awaited<ReturnType<typeof findLean>>>;

function toInquiry(d: InquiryDoc): Inquiry {
  return {
    id: String(d._id),
    kind: d.kind,
    name: d.name,
    email: d.email,
    company: d.company ?? undefined,
    phone: d.phone ?? undefined,
    country: d.country ?? undefined,
    products: d.products ?? [],
    product: d.product ?? undefined,
    quantity: d.quantity ?? undefined,
    sample: d.sample ?? undefined,
    branding: d.branding ?? undefined,
    message: d.message ?? undefined,
    locale: d.locale ?? undefined,
    status: d.status,
    note: d.note ?? undefined,
    emailed: Boolean(d.emailed),
    createdAt: new Date(d.createdAt).toISOString(),
  };
}
