'use client';

import Image from 'next/image';
import { type FormEvent, useActionState, useState, useTransition } from 'react';
import { deleteCategory, saveCategory, type CategoryFormState } from '@/app/admin/categories-actions';
import type { CategoryLocale } from '@/lib/catalog/types';
import { ImageUpload } from './ImageUpload';
import { Card, CardTitle, Icon, btnDark, btnLight, field, fieldLabel } from './ui';

const LANGUAGES: [CategoryLocale, string][] = [
  ['en', 'English'],
  ['de', 'German'],
  ['no', 'Norwegian'],
  ['it', 'Italian'],
  ['fr', 'French'],
];

export interface CategoryFormData {
  slug: string;
  name: Record<CategoryLocale, string>;
  intro: Record<CategoryLocale, string>;
  /** Uploaded cover ('' = automatic). */
  cover: string;
  /** Photo used when no cover is uploaded (first featured product). */
  autoCover: string;
  visible: boolean;
  order: number;
  count: number;
  /** Creating a category (admin → Categories → New category). */
  isNew?: boolean;
}

/**
 * Category editor (admin → Categories → Edit / New category): texts in five languages, cover photo,
 * visibility and order; a new category also gets its web address. Empty categories can be deleted.
 */
export function CategoryForm({ category, dbReady, created }: { category: CategoryFormData; dbReady: boolean; created?: boolean }) {
  const [state, action, saving] = useActionState<CategoryFormState, FormData>(saveCategory, {});
  const [, start] = useTransition();
  const [deleting, startDelete] = useTransition();
  const [deleteError, setDeleteError] = useState('');
  const [slugHint, setSlugHint] = useState('');
  const [lang, setLang] = useState<CategoryLocale>('en');
  const [cover, setCover] = useState(category.cover);
  const bad = (name: string) => (state.fields?.includes(name) ? '!border-brand' : '');
  const disabled = !dbReady || saving || deleting;
  const remove = () => {
    if (!window.confirm(`Delete the category “${category.name.en || category.slug}”? This cannot be undone.`)) return;
    setDeleteError('');
    startDelete(async () => {
      const r = await deleteCategory(category.slug);
      if (r?.error) setDeleteError(r.error);
    });
  };
  const shown = cover || category.autoCover;

  // a transition instead of <form action>, so typed values stay when the server returns an error
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    start(() => action(data));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {category.isNew ? <input type="hidden" name="isNew" value="1" /> : <input type="hidden" name="slug" value={category.slug} />}
      <input type="hidden" name="cover" value={cover} />

      {created && !state.error && !state.saved && (
        <p className="rounded-2xl border border-emerald-600/25 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          Category created. Add products to it (Products → Add product); it shows on the website once it has a live product.
        </p>
      )}
      {state.error && (
        <p role="alert" className="rounded-2xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm font-semibold text-brand">
          {state.error}
        </p>
      )}
      {state.saved && !saving && (
        <p className="rounded-2xl border border-emerald-600/25 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          Saved. The website shows the changes within a few seconds.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* texts */}
        <Card>
          <CardTitle title="Name and description" />
          <div className="flex flex-wrap gap-1.5 border-b border-ink/10 px-5 py-3" role="tablist">
            {LANGUAGES.map(([l, label]) => {
              const missing = state.fields?.some((f) => f.endsWith(`_${l}`));
              return (
                <button
                  key={l}
                  type="button"
                  role="tab"
                  aria-selected={lang === l}
                  onClick={() => setLang(l)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                    lang === l ? 'bg-ink text-white' : 'text-ink/70 hover:bg-ink/5'
                  } ${missing ? '!text-brand' : ''}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {/* every language stays in the form (hidden ones too), so one save sends all five */}
          {LANGUAGES.map(([l, label]) => (
            <div key={l} hidden={lang !== l} className="space-y-4 p-5">
              <label className="block">
                <span className={fieldLabel}>Name ({label})</span>
                <input
                  name={`name_${l}`}
                  defaultValue={category.name[l]}
                  maxLength={60}
                  className={`${field} ${bad(`name_${l}`)}`}
                  disabled={disabled}
                  onChange={l === 'en' && category.isNew ? (e) => setSlugHint(e.target.value) : undefined}
                />
              </label>
              {l === 'en' && category.isNew && (
                <label className="block">
                  <span className={fieldLabel}>Web address (optional)</span>
                  <input
                    name="slug"
                    maxLength={60}
                    placeholder={slugHint ? slugHint.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : 'made from the English name'}
                    className={`${field} ${bad('slug')}`}
                    disabled={disabled}
                  />
                  <span className="mt-1 block text-xs text-ink/60">The page will be /products/&lt;address&gt;. It cannot be changed later.</span>
                </label>
              )}
              <label className="block">
                <span className={fieldLabel}>Description ({label})</span>
                <textarea
                  name={`intro_${l}`}
                  defaultValue={category.intro[l]}
                  rows={5}
                  maxLength={600}
                  className={`${field} ${bad(`intro_${l}`)}`}
                  disabled={disabled}
                />
                <span className="mt-1 block text-xs text-ink/60">
                  {l === 'en'
                    ? 'Required. Shown at the top of the category page and on the products page.'
                    : category.isNew
                      ? 'Leave empty to show the English text.'
                      : 'Leave empty to use the built-in translation (or the English text).'}
                </span>
              </label>
            </div>
          ))}
        </Card>

        <div className="space-y-6">
          {/* cover */}
          <Card>
            <CardTitle title="Cover photo" />
            <div className="space-y-3 p-5">
              <div className="relative aspect-square overflow-hidden rounded-2xl border border-ink/10 bg-[#f3f3f3]">
                {shown ? (
                  <Image src={shown} alt="" fill sizes="320px" className="object-cover mix-blend-multiply" />
                ) : (
                  <span className="grid h-full place-items-center text-ink/40">
                    <Icon name="image" className="h-8 w-8" />
                  </span>
                )}
                <span className="absolute top-3 left-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-ink uppercase">
                  {cover ? 'Uploaded' : 'Automatic'}
                </span>
              </div>
              <p className={`text-xs text-ink/65 ${bad('cover') ? 'font-semibold !text-brand' : ''}`}>
                {cover ? 'This photo is shown on the category card.' : 'No photo uploaded: the first featured product photo is used.'}
              </p>
              <div className="flex flex-wrap gap-2">
                <ImageUpload folder="categories" disabled={disabled} label={cover ? 'Replace photo' : 'Upload photo'} onUploaded={(urls) => setCover(urls[0])} />
                {cover && (
                  <button type="button" className={btnLight} disabled={disabled} onClick={() => setCover('')}>
                    Use automatic
                  </button>
                )}
              </div>
            </div>
          </Card>

          {/* visibility and order */}
          <Card>
            <CardTitle title="On the website" />
            <div className="space-y-4 p-5">
              <label className="flex items-start gap-3">
                <input name="visible" type="checkbox" defaultChecked={category.visible} className="mt-0.5 h-4 w-4 accent-[#de0000]" disabled={disabled} />
                <span>
                  <span className="block text-sm font-bold text-ink">Show on the website</span>
                  <span className="block text-xs text-ink/65">
                    Off hides the category and its {category.count} products from menus, lists and search. Nothing is deleted.
                  </span>
                </span>
              </label>
              <label className="block">
                <span className={fieldLabel}>Position</span>
                <input name="order" type="number" min={0} max={9999} step={1} defaultValue={category.order} className={`${field} ${bad('order')}`} disabled={disabled} />
                <span className="mt-1 block text-xs text-ink/60">Lower numbers come first in menus and lists (e.g. 10, 20, 30…).</span>
              </label>
            </div>
          </Card>

          {/* delete: only an empty category, so no product is ever lost by accident */}
          {!category.isNew && (
            <Card>
              <CardTitle title="Delete category" />
              <div className="space-y-3 p-5">
                <p className="text-xs text-ink/65">
                  {category.count
                    ? `This category has ${category.count} product${category.count === 1 ? '' : 's'}. Move them to another category or delete them first; or switch the category off above to hide it.`
                    : 'This category has no products. Deleting it removes it from the website and the admin for good.'}
                </p>
                {deleteError && <p className="text-xs font-semibold text-brand">{deleteError}</p>}
                <button
                  type="button"
                  onClick={remove}
                  disabled={disabled || category.count > 0}
                  className="inline-flex items-center gap-2 rounded-full border border-brand/40 px-4 py-2 text-xs font-bold text-brand transition-colors hover:bg-brand hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-brand"
                >
                  <Icon name="trash" className="h-4 w-4" /> {deleting ? 'Deleting…' : 'Delete category'}
                </button>
              </div>
            </Card>
          )}
        </div>
      </div>

      <div className="sticky bottom-4 z-10 flex items-center justify-between gap-4 rounded-2xl border border-ink bg-white px-5 py-3.5 shadow-[0_10px_30px_rgba(0,0,0,.08)]">
        <p className="text-xs text-ink/70">{dbReady ? 'Changes go live on the website after saving.' : 'Saving is not available right now.'}</p>
        <button type="submit" className={btnDark} disabled={disabled}>
          {saving ? 'Saving…' : category.isNew ? 'Create category' : 'Save category'}
        </button>
      </div>
    </form>
  );
}
