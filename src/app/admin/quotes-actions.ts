'use server';

import { isValidObjectId } from 'mongoose';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';
import { isInquiryStatus } from '@/lib/admin/inquiries';
import { connectDb, dbConfigured } from '@/lib/db/connect';
import { InquiryModel } from '@/lib/db/models';

/** Changes a request's status and internal note (the form on each row of the quotes inbox). */
export async function updateInquiry(form: FormData) {
  await requireAdmin();
  if (!dbConfigured()) return;
  const id = String(form.get('id') ?? '');
  const status = String(form.get('status') ?? '');
  const note = String(form.get('note') ?? '').trim().slice(0, 2000);
  if (!isValidObjectId(id) || !isInquiryStatus(status)) return;

  await connectDb();
  await InquiryModel.updateOne({ _id: id }, note ? { $set: { status, note } } : { $set: { status }, $unset: { note: 1 } });
  revalidatePath('/admin', 'layout');
}

/** Removes a request for good (spam, test entries). */
export async function deleteInquiry(form: FormData) {
  await requireAdmin();
  if (!dbConfigured()) return;
  const id = String(form.get('id') ?? '');
  if (!isValidObjectId(id)) return;
  await connectDb();
  await InquiryModel.deleteOne({ _id: id });
  revalidatePath('/admin', 'layout');
}
