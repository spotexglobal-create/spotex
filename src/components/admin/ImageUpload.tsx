'use client';

import { useRef, useState } from 'react';
import { Icon, btnLight } from './ui';

const MAX_MB = 10;

/**
 * "Upload photos" button. Asks our server for a signature, then sends each file straight to Cloudinary
 * and hands back the https://res.cloudinary.com/… addresses.
 */
export function ImageUpload({
  folder,
  multiple = false,
  disabled,
  onUploaded,
  label = 'Upload photo',
}: {
  folder: 'products' | 'blog';
  multiple?: boolean;
  disabled?: boolean;
  onUploaded: (urls: string[]) => void;
  label?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const busy = Boolean(status);

  async function upload(files: File[]) {
    setError('');
    const urls: string[] = [];
    try {
      for (const [i, file] of files.entries()) {
        if (!file.type.startsWith('image/')) throw new Error(`${file.name} is not an image.`);
        if (file.size > MAX_MB * 1024 * 1024) throw new Error(`${file.name} is larger than ${MAX_MB} MB.`);
        setStatus(files.length > 1 ? `Uploading ${i + 1} of ${files.length}…` : 'Uploading…');

        // a fresh signature per file (they expire after an hour)
        const sig = await fetch('/admin/api/upload-signature', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folder }),
        });
        const signed = (await sig.json().catch(() => ({}))) as { url?: string; fields?: Record<string, string>; error?: string };
        if (!sig.ok || !signed.url || !signed.fields) throw new Error(signed.error ?? 'Could not start the upload.');

        const body = new FormData();
        for (const [k, v] of Object.entries(signed.fields)) body.append(k, v);
        body.append('file', file);
        const res = await fetch(signed.url, { method: 'POST', body });
        const out = (await res.json().catch(() => ({}))) as { secure_url?: string; error?: { message?: string } };
        if (!res.ok || !out.secure_url) throw new Error(out.error?.message ?? `Upload of ${file.name} failed.`);
        urls.push(out.secure_url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      if (urls.length) onUploaded(urls);
      setStatus('');
      if (input.current) input.current.value = '';
    }
  }

  return (
    <div>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) void upload(files);
        }}
      />
      <button type="button" className={btnLight} disabled={disabled || busy} onClick={() => input.current?.click()}>
        <Icon name="image" className="h-4 w-4" /> {status || label}
      </button>
      {error && <p className="mt-2 text-xs font-semibold text-brand">{error}</p>}
    </div>
  );
}
