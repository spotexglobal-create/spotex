import { getLocale, getTranslations } from "next-intl/server";
import { getCategoryRecords } from "./index";
import type { CategoryLocale, CategorySlug, Product, Spec } from "./types";

/**
 * Turns language-independent catalogue records into display text for the current locale.
 * Category names and intros come from the database (admin → Categories) and fall back to the
 * message files when a language is left empty. Server-only (uses getTranslations).
 */
export async function getCatalogText() {
  const [t, locale, records] = await Promise.all([
    getTranslations("Catalog"),
    getLocale(),
    getCategoryRecords(),
  ]);
  const record = new Map(records.map((r) => [r.slug, r]));
  const stored = (slug: CategorySlug, field: "name" | "intro") =>
    record.get(slug)?.[field][locale as CategoryLocale];

  const specValue = (spec: Spec) =>
    spec.value
      ? t(`values.${spec.value}`)
      : t(`units.${spec.unit ?? "gsm"}`, { n: spec.amount ?? 0 });

  return {
    categoryName: (slug: CategorySlug) =>
      stored(slug, "name") || t(`categories.${slug}.name`),
    categoryIntro: (slug: CategorySlug) =>
      stored(slug, "intro") || t(`categories.${slug}.intro`),
    productName: (p: Product) =>
      p.line ? `${t(`types.${p.type}`)} ${p.line}` : t(`types.${p.type}`),
    specLabel: (spec: Spec) => t(`labels.${spec.label}`),
    specValue,
    /** Short one-line summary, e.g. "Pearl weave · 280 GSM · Ripstop". */
    summary: (p: Product) => p.specs.slice(0, 3).map(specValue).join(" · "),
  };
}

export type CatalogText = Awaited<ReturnType<typeof getCatalogText>>;
