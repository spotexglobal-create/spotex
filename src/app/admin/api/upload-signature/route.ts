import { NextResponse } from 'next/server';
import { getSession } from '@/lib/admin/auth';
import { UPLOAD_FOLDERS, signUpload, type UploadFolder } from '@/lib/cloudinary';

/**
 * POST /admin/api/upload-signature  { folder: "products" | "blog" }
 * Signs one Cloudinary upload for a signed-in admin. Lives under /admin so the admin cookie (path /admin) is sent.
 */
export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { folder?: string };
  const folder = (body.folder ?? 'products') as UploadFolder;
  if (!(folder in UPLOAD_FOLDERS)) return NextResponse.json({ error: 'Unknown folder' }, { status: 400 });

  const signed = signUpload(folder);
  if (!signed) return NextResponse.json({ error: 'Photo upload is not available right now. Please try again later.' }, { status: 503 });
  return NextResponse.json(signed, { headers: { 'Cache-Control': 'no-store' } });
}
