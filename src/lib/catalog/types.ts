import type messages from '@/messages/en.json';

/**
 * Catalogue types. Language-independent: every human-readable word is a message key
 * (see src/messages/*.json → "Catalog"), so one product record serves all four languages.
 * The same shapes are used by the MongoDB models later, so pages won't change when data moves.
 */

/**
 * Built-in categories: used when there is no database (or it has no categories yet) and by the seed.
 * With a database, admin → Categories is the real list: categories can be added and deleted there.
 * ('belts' is shown as "BJJ Belts", 'bags' as "Gi Bags".)
 */
export const CATEGORY_SLUGS = ['bjj-gis', 'judo-uniforms', 'rash-guards', 'mma-shorts', 'bags', 'belts'] as const;

/** A category's web address part, e.g. "bjj-gis". Any category stored in the database. */
export type CategorySlug = string;

/** Lowercase letters, digits and single dashes. */
export const CATEGORY_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const PRODUCT_TYPES = [
  'bjjGi',
  'judoUniform',
  'rashGuard',
  'bjjBelt',
  'giFabricBelt',
  'casualBelt',
  'judoBelt',
  'mmaShorts',
  'giBag',
  // named after its category ("Gloves", "Gloves Pro …"); for categories added in the admin
  'general',
] as const;

export type ProductType = (typeof PRODUCT_TYPES)[number];

/** Spec rows shown on the product page. Text values are keys in "Catalog.values". */
export const SPEC_LABELS = ['weave', 'jacket', 'weight', 'pants', 'colours', 'waist', 'width', 'sizes', 'print', 'use'] as const;
export type SpecLabel = (typeof SPEC_LABELS)[number];

export type SpecValue = keyof (typeof messages)['Catalog']['values'];

export interface Spec {
  label: SpecLabel;
  /** Message key in "Catalog.values" … */
  value?: SpecValue;
  /** … or a number with a unit. */
  amount?: number;
  unit?: 'gsm' | 'oz' | 'cm';
}

export interface Category {
  slug: CategorySlug;
  /** Image used on the category card. */
  cover: string;
}

export const CATEGORY_LOCALES = ['en', 'de', 'no', 'it', 'fr'] as const;
export type CategoryLocale = (typeof CATEGORY_LOCALES)[number];
export type LocalizedText = Partial<Record<CategoryLocale, string>>;

/** A category as stored in the database (admin → Categories). Empty texts fall back to the message files. */
export interface CategoryRecord {
  slug: CategorySlug;
  name: LocalizedText;
  intro: LocalizedText;
  /** Uploaded cover photo; empty means "first featured product photo". */
  cover: string;
  visible: boolean;
  order: number;
}

export interface Product {
  slug: string;
  code: string;
  category: CategorySlug;
  type: ProductType;
  /** Product line name, kept as-is in every language (e.g. "Academy"). */
  line?: string;
  specs: Spec[];
  /** Absolute image URLs, main photo first. */
  images: string[];
  featured?: boolean;
  /** False hides the product from the website (still listed in the admin). Default true. */
  visible?: boolean;
}
