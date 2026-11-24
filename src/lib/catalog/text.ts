import { getTranslations } from "next-intl/server";
import type { CategorySlug, Product, Spec } from "./types";

/**
 * Turns language-independent catalogue records into display text for the current locale.
 * Server-only (uses getTranslations).
 */
export async function getCatalogText() {
  const t = await getTranslations("Catalog");

  const specValue = (spec: Spec) =>
    spec.value
      ? t(`values.${spec.value}`)
      : t(`units.${spec.unit ?? "gsm"}`, { n: spec.amount ?? 0 });

  return {
    categoryName: (slug: CategorySlug) => t(`categories.${slug}.name`),
    categoryIntro: (slug: CategorySlug) => t(`categories.${slug}.intro`),
    productName: (p: Product) =>
      p.line ? `${t(`types.${p.type}`)} ${p.line}` : t(`types.${p.type}`),
    specLabel: (spec: Spec) => t(`labels.${spec.label}`),
    specValue,
    /** Short one-line summary, e.g. "Pearl weave · 280 GSM · Ripstop". */
    summary: (p: Product) => p.specs.slice(0, 3).map(specValue).join(" · "),
  };
}

export type CatalogText = Awaited<ReturnType<typeof getCatalogText>>;
