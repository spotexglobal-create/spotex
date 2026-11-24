'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useActionState, useState, useTransition } from 'react';
import { deleteProduct, saveProduct, type ProductFormState } from '@/app/admin/products-actions';
import type { Product, Spec } from '@/lib/catalog/types';
import { ImageUpload } from './ImageUpload';
import { Card, CardTitle, Icon, btnDark, btnLight, field, fieldLabel } from './ui';

export interface Option {
  value: string;
  label: string;
}

export interface ProductFormOptions {
  categories: Option[];
  types: Option[];
  labels: Option[];
  /** Translatable spec values (message keys in "Catalog.values"). */
  values: Option[];
}

/** One editable spec row: either a fixed text value or a number with a unit. */
interface SpecRow {
  label: string;
  value: string;
  amount: string;
  unit: string;
}

const toRow = (s: Spec): SpecRow => ({ label: s.label, value: s.value ?? '', amount: s.amount != null ? String(s.amount) : '', unit: s.unit ?? 'gsm' });
const toSpec = (r: SpecRow) => (r.value ? { label: r.label, value: r.value } : { label: r.label, amount: Number(r.amount), unit: r.unit });

/** Same rule as the server: photos in public/ or Cloudinary (the hosts next/image may load). */
const IMAGE = /^(\/[\w\-./]+|https:\/\/res\.cloudinary\.com\/[^\s"'<>]+)$/;

const invalid = (state: ProductFormState, name: string) => state.fields?.includes(name);
const fieldCls = (state: ProductFormState, name: string, extra = '') => `${field} ${extra} ${invalid(state, name) ? '!border-brand' : ''}`;

/**
 * Product editor: details, specifications, photos and publishing. The same form adds a new product.
 * Saving needs the database; without it the form stays read-only.
 */
export function ProductForm({
  product,
  options,
  dbReady,
  saved,
  preview,
}: {
  product?: Product;
  options: ProductFormOptions;
  dbReady: boolean;
  saved?: boolean;
  preview?: { name: string; summary: string };
}) {
  const [state, action, saving] = useActionState(saveProduct, {});
  const [specs, setSpecs] = useState<SpecRow[]>(product?.specs.map(toRow) ?? [{ label: 'weight', value: '', amount: '', unit: 'gsm' }]);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [newImage, setNewImage] = useState('');
  const [deleting, startDelete] = useTransition();
  const disabled = !dbReady || saving;

  const setSpec = (i: number, patch: Partial<SpecRow>) => setSpecs((rows) => rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const moveImage = (i: number, to: number) =>
    setImages((list) => {
      const next = [...list];
      const [item] = next.splice(i, 1);
      next.splice(to, 0, item);
      return next;
    });
  const [imageError, setImageError] = useState('');
  const addImage = () => {
    const src = newImage.trim();
    if (!IMAGE.test(src)) return setImageError('Use a photo from /products/… or a res.cloudinary.com address.');
    if (!images.includes(src)) setImages([...images, src]);
    setNewImage('');
    setImageError('');
  };

  const onDelete = () => {
    if (!product || !confirm(`Delete ${product.code}? It disappears from the website. This cannot be undone.`)) return;
    startDelete(async () => {
      await deleteProduct(product.slug);
    });
  };

  return (
    <form action={action}>
      {!dbReady && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <Icon name="database" className="mt-0.5 h-[18px] w-[18px]" />
          <p>
            <b>Read-only.</b> Saving switches on as soon as the database (MONGODB_URI) is connected.
          </p>
        </div>
      )}
      {saved && !state.error && (
        <p className="mb-6 rounded-2xl border border-emerald-600/25 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          Saved. The website shows the change within a few seconds.
        </p>
      )}
      {state.error && (
        <p role="alert" className="mb-6 rounded-2xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm font-semibold text-brand">
          {state.error}
        </p>
      )}

      <input type="hidden" name="originalSlug" value={product?.slug ?? ''} />
      <input type="hidden" name="specs" value={JSON.stringify(specs.map(toSpec))} />
      <input type="hidden" name="images" value={JSON.stringify(images)} />

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card>
            <CardTitle title="Details" />
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <label>
                <span className={fieldLabel}>Product code</span>
                <input name="code" className={fieldCls(state, 'code')} defaultValue={product?.code} placeholder="SI-JJU-1010" required disabled={disabled} />
              </label>
              <label>
                <span className={fieldLabel}>URL slug</span>
                <input name="slug" className={fieldCls(state, 'slug')} defaultValue={product?.slug} placeholder="made from the code if empty" disabled={disabled} />
              </label>
              <label>
                <span className={fieldLabel}>Category</span>
                <select name="category" className={fieldCls(state, 'category')} defaultValue={product?.category} disabled={disabled}>
                  {options.categories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className={fieldLabel}>Product type</span>
                <select name="type" className={fieldCls(state, 'type')} defaultValue={product?.type} disabled={disabled}>
                  {options.types.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="sm:col-span-2">
                <span className={fieldLabel}>Line name (optional)</span>
                <input name="line" className={field} defaultValue={product?.line} placeholder="e.g. Academy" disabled={disabled} />
                <span className="mt-1 block text-xs text-ink/45">Shown after the type, the same in every language: “Judo Uniform Academy”.</span>
              </label>
            </div>
          </Card>

          <Card>
            <CardTitle title="Specifications">
              <button
                type="button"
                className={btnLight}
                disabled={disabled || specs.length >= 20}
                onClick={() => setSpecs([...specs, { label: 'weave', value: options.values[0]?.value ?? '', amount: '', unit: 'gsm' }])}
              >
                <Icon name="plus" className="h-3.5 w-3.5" /> Add row
              </button>
            </CardTitle>
            <div className={`divide-y divide-ink/[0.07] ${invalid(state, 'specs') ? 'ring-1 ring-brand ring-inset' : ''}`}>
              {specs.map((s, i) => {
                const numeric = !s.value;
                return (
                  <div key={i} className="grid grid-cols-1 items-center gap-2 px-5 py-3 sm:grid-cols-[150px_1fr_auto] sm:gap-3">
                    <select className={`${field} mt-0`} value={s.label} onChange={(e) => setSpec(i, { label: e.target.value })} disabled={disabled} aria-label="Spec">
                      {options.labels.map((l) => (
                        <option key={l.value} value={l.value}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <select
                        className={`${field} mt-0`}
                        value={numeric ? '#' : s.value}
                        onChange={(e) => setSpec(i, { value: e.target.value === '#' ? '' : e.target.value })}
                        disabled={disabled}
                        aria-label="Value"
                      >
                        <option value="#">Number…</option>
                        {options.values.map((v) => (
                          <option key={v.value} value={v.value}>
                            {v.label}
                          </option>
                        ))}
                      </select>
                      {numeric && (
                        <>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            className={`${field} mt-0 w-24`}
                            value={s.amount}
                            onChange={(e) => setSpec(i, { amount: e.target.value })}
                            disabled={disabled}
                            aria-label="Amount"
                          />
                          <select className={`${field} mt-0 w-24`} value={s.unit} onChange={(e) => setSpec(i, { unit: e.target.value })} disabled={disabled} aria-label="Unit">
                            <option value="gsm">GSM</option>
                            <option value="oz">oz</option>
                            <option value="cm">cm</option>
                          </select>
                        </>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSpecs(specs.filter((_, j) => j !== i))}
                      disabled={disabled}
                      className="justify-self-end rounded-lg px-2 py-1 text-xs font-bold text-ink/45 hover:bg-ink/5 hover:text-brand disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="border-t border-ink/[0.07] px-5 py-3 text-xs text-ink/45">Values are translated into every language automatically.</p>
          </Card>

          <Card>
            <CardTitle title="Photos" />
            <div className={`p-5 ${invalid(state, 'images') ? 'ring-1 ring-brand ring-inset' : ''}`}>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {images.map((src, i) => (
                  <div key={src} className="group relative aspect-square overflow-hidden rounded-xl border border-ink/10 bg-[#f3f3f3]">
                    <Image src={src} alt="" fill sizes="140px" className="object-cover mix-blend-multiply" />
                    {i === 0 && <span className="absolute top-2 left-2 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold text-white">Main</span>}
                    {!disabled && (
                      <span className="absolute inset-x-1.5 bottom-1.5 flex justify-between gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                        <button type="button" title="Make main photo" onClick={() => moveImage(i, 0)} className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-bold shadow">
                          Main
                        </button>
                        <button
                          type="button"
                          title="Remove photo"
                          onClick={() => setImages(images.filter((x) => x !== src))}
                          className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-bold text-brand shadow"
                        >
                          ✕
                        </button>
                      </span>
                    )}
                  </div>
                ))}
                {!images.length && <p className="col-span-full text-sm text-ink/50">No photos yet. Add at least one.</p>}
              </div>
              <div className="mt-4">
                <ImageUpload
                  folder="products"
                  multiple
                  label="Upload photos"
                  disabled={disabled || images.length >= 12}
                  onUploaded={(urls) => setImages((list) => [...list, ...urls.filter((u) => !list.includes(u))].slice(0, 12))}
                />
                <p className="mt-1.5 text-xs text-ink/45">JPG, PNG or WebP, up to 10 MB each. White background works best. Or paste an address below.</p>
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  className={`${field} mt-0`}
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addImage();
                    }
                  }}
                  placeholder="/products/photo.webp or https://res.cloudinary.com/…"
                  disabled={disabled}
                  aria-label="Photo address"
                />
                <button type="button" className={btnLight} onClick={addImage} disabled={disabled || !newImage.trim()}>
                  Add
                </button>
              </div>
              {imageError && <p className="mt-2 text-xs font-semibold text-brand">{imageError}</p>}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardTitle title="Publishing" />
            <div className="space-y-4 p-5">
              <label className="flex items-center justify-between gap-3 text-sm font-semibold">
                Visible on website
                <input name="visible" type="checkbox" defaultChecked={product?.visible !== false} className="h-4 w-4 accent-[var(--color-brand)]" disabled={disabled} />
              </label>
              <label className="flex items-center justify-between gap-3 text-sm font-semibold">
                Featured (category cover)
                <input name="featured" type="checkbox" defaultChecked={product?.featured} className="h-4 w-4 accent-[var(--color-brand)]" disabled={disabled} />
              </label>
              <button type="submit" className={`${btnDark} w-full justify-center`} disabled={disabled}>
                {saving ? 'Saving…' : product ? 'Save product' : 'Create product'}
              </button>
              {product && (
                <a
                  href={`/en/products/${product.category}/${product.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${btnLight} w-full justify-center`}
                >
                  <Icon name="eye" className="h-4 w-4" /> View on website
                </a>
              )}
              {product && dbReady && (
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={deleting || saving}
                  className="w-full rounded-full px-4 py-2 text-xs font-bold tracking-[0.08em] text-brand uppercase hover:bg-brand/5 disabled:opacity-40"
                >
                  {deleting ? 'Deleting…' : 'Delete product'}
                </button>
              )}
            </div>
          </Card>
          {product && preview && (
            <Card>
              <CardTitle title="Preview" />
              <div className="p-5">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#f3f3f3]">
                  {product.images[0] && <Image src={product.images[0]} alt="" fill sizes="300px" className="object-contain p-3 mix-blend-multiply" />}
                </div>
                <p className="mt-3 text-[11px] font-extrabold tracking-[0.12em] text-brand">{product.code}</p>
                <p className="display text-2xl text-ink">{preview.name}</p>
                <p className="mt-1 text-xs text-ink/55">{preview.summary}</p>
              </div>
            </Card>
          )}
          <Link href="/admin/products" className="inline-block text-xs font-semibold text-ink/50 hover:text-brand">
            ← All products
          </Link>
        </div>
      </div>
    </form>
  );
}
