import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { InquiryDetail } from '@/components/admin/InquiryDetail';
import { getInquiry } from '@/lib/admin/inquiries';

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const q = await getInquiry((await params).id);
  return { title: q ? `Message from ${q.name}` : 'Message' };
}

export default async function MessagePage({ params, searchParams }: Props) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const q = await getInquiry(id);
  if (!q) notFound();
  if (q.kind === 'quote') redirect(`/admin/quotes/${q.id}`);
  return <InquiryDetail q={q} section="messages" saved={saved === '1'} />;
}
