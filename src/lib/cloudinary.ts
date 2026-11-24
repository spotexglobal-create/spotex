import { createHash } from 'node:crypto';

/**
 * Cloudinary signed uploads. The browser uploads the file straight to Cloudinary; the server only signs
 * the request, so the API secret never leaves the server.
 *   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET  (Cloudinary → Settings → API Keys)
 *   or one CLOUDINARY_URL = cloudinary://<api_key>:<api_secret>@<cloud_name>
 */

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export function cloudinaryConfig(): CloudinaryConfig | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (cloudName && apiKey && apiSecret) return { cloudName, apiKey, apiSecret };

  const raw = process.env.CLOUDINARY_URL?.trim();
  const m = raw?.match(/^cloudinary:\/\/([^:]+):([^@]+)@([\w-]+)$/);
  return m ? { apiKey: m[1], apiSecret: m[2], cloudName: m[3] } : null;
}

export const UPLOAD_FOLDERS = { products: 'spotex/products', blog: 'spotex/blog' } as const;
export type UploadFolder = keyof typeof UPLOAD_FOLDERS;

/** Parameters the browser sends along with the file. Everything except file, api_key and signature is signed. */
export function signUpload(folder: UploadFolder) {
  const cfg = cloudinaryConfig();
  if (!cfg) return null;
  const params: Record<string, string> = {
    allowed_formats: 'jpg,jpeg,png,webp,avif',
    folder: UPLOAD_FOLDERS[folder],
    timestamp: String(Math.floor(Date.now() / 1000)),
  };
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  const signature = createHash('sha1').update(toSign + cfg.apiSecret).digest('hex');
  return {
    url: `https://api.cloudinary.com/v1_1/${cfg.cloudName}/image/upload`,
    fields: { ...params, api_key: cfg.apiKey, signature },
  };
}
