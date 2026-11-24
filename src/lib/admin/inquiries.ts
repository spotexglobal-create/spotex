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

/** Count per status plus "all". Zeroes without a database. */
export async function getInquiryCounts(): Promise<Record<InquiryStatus | 'all', number>> {
  const counts = Object.fromEntries([...INQUIRY_STATUSES, 'all'].map((s) => [s, 0])) as Record<InquiryStatus | 'all', number>;
  if (!dbConfigured()) return counts;
  await connectDb();
  const rows = await InquiryModel.aggregate<{ _id: InquiryStatus; n: number }>([{ $group: { _id: '$status', n: { $sum: 1 } } }]);
  for (const r of rows) {
    counts[r._id] = r.n;
    counts.all += r.n;
  }
  return counts;
}

export const INQUIRIES_PER_PAGE = 25;

/** Newest first, optionally one status, one page at a time. */
export async function getInquiries(status?: InquiryStatus, page = 1): Promise<Inquiry[]> {
  if (!dbConfigured()) return [];
  await connectDb();
  const docs = await InquiryModel.find(status ? { status } : {})
    .sort({ createdAt: -1 })
    .skip((page - 1) * INQUIRIES_PER_PAGE)
    .limit(INQUIRIES_PER_PAGE)
    .lean();
  return docs.map((d) => ({
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
  }));
}
