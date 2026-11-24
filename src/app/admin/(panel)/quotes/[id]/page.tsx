import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { InquiryDetail } from '@/components/admin/InquiryDetail';
import { getInquiry } from '@/lib/admin/inquiries';

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const q = await getInquiry((await params).id);
  return { title: q ? `Quote request from ${q.name}` : 'Quote request' };
}

export default async function QuotePage({ params, searchParams }: Props) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const q = await getInquiry(id);
  if (!q) notFound();
  if (q.kind === 'message') redirect(`/admin/messages/${q.id}`);
  return <InquiryDetail q={q} section="quotes" saved={saved === '1'} />;
}
