import type { InquiryStatus } from '@/lib/db/models';

/** Labels and helpers shared by the quote list and the quote detail page. */

export const STATUS: Record<InquiryStatus, { label: string; tone: 'red' | 'amber' | 'grey' | 'green' }> = {
  new: { label: 'New', tone: 'red' },
  replied: { label: 'Replied', tone: 'amber' },
  sample: { label: 'Sample sent', tone: 'grey' },
  won: { label: 'Won', tone: 'green' },
  lost: { label: 'Lost', tone: 'grey' },
};

/** A general message only needs these two. */
export const MESSAGE_STATUSES = ['new', 'replied'] as const satisfies readonly InquiryStatus[];

export const quoteDate =(iso: string) =>
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Karachi' }).format(new Date(iso));

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('') || '?';
