import type messages from '@/messages/en.json';

/**
 * Catalogue types. Language-independent: every human-readable word is a message key
 * (see src/messages/*.json → "Catalog"), so one product record serves all four languages.
 * The same shapes are used by the MongoDB models later, so pages won't change when data moves.
 */

export const CATEGORY_SLUGS = [
  'bjj-gis',
  'judo-uniforms',
  'karate-uniforms',
  'taekwondo-uniforms',
  'sambo-uniforms',
  'belts',
  'mma-shorts',
  'rash-guards',
  'fight-wear',
  'bags',
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export const PRODUCT_TYPES = [
  'bjjGi',
  'judoUniform',
  'karateUniform',
  'taekwondoUniform',
  'samboUniform',
  'bjjBelt',
  'giFabricBelt',
  'casualBelt',
  'judoBelt',
  'mmaShorts',
  'hoodie',
  'singlet',
  'giBag',
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
