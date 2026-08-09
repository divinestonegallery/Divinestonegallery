import { and, asc, eq } from "drizzle-orm";
import { businessSettings, mediaAssets, sitePages, siteSections } from "@/db/schema";

export type PublishedSection = {
  id: string; sectionKey: string; blockType: "hero" | "rich_text" | "image_text" | "collection" | "feature_grid" | "callout" | "faq";
  eyebrow: string | null; heading: string | null; body: string | null; ctaLabel: string | null; ctaHref: string | null;
  secondaryCtaLabel: string | null; secondaryCtaHref: string | null; mediaPath: string | null; mediaAltText: string | null;
  mediaPosition: "left" | "right" | "background"; contentJson: string; styleVariant: string; sortOrder: number;
};
export type PublishedPage = { id: string; slug: string; title: string; navigationTitle: string | null; seoTitle: string | null; seoDescription: string | null; updatedAt: number; sections: PublishedSection[] };

async function database() { const { getDb } = await import("@/db"); return getDb(); }

export async function getPublishedPage(slug: string): Promise<PublishedPage | null> {
  try {
    const db = await database();
    const [page] = await db.select().from(sitePages).where(and(eq(sitePages.slug, slug), eq(sitePages.status, "published"))).limit(1);
    if (!page) return null;
    const sections = await db.select({
      id: siteSections.id, sectionKey: siteSections.sectionKey, blockType: siteSections.blockType, eyebrow: siteSections.eyebrow,
      heading: siteSections.heading, body: siteSections.body, ctaLabel: siteSections.ctaLabel, ctaHref: siteSections.ctaHref,
      secondaryCtaLabel: siteSections.secondaryCtaLabel, secondaryCtaHref: siteSections.secondaryCtaHref, mediaPath: mediaAssets.publicPath,
      mediaAltText: mediaAssets.altText, mediaPosition: siteSections.mediaPosition, contentJson: siteSections.contentJson,
      styleVariant: siteSections.styleVariant, sortOrder: siteSections.sortOrder,
    }).from(siteSections).leftJoin(mediaAssets, eq(siteSections.mediaAssetId, mediaAssets.id))
      .where(and(eq(siteSections.pageId, page.id), eq(siteSections.isVisible, true))).orderBy(asc(siteSections.sortOrder));
    return { ...page, sections };
  } catch { return null; }
}

export async function listPublishedPages() {
  try { const db = await database(); return await db.select({ slug: sitePages.slug, updatedAt: sitePages.updatedAt }).from(sitePages).where(eq(sitePages.status, "published")); }
  catch { return []; }
}

export async function getPublishedBusinessSettings() {
  try { const db = await database(); const rows = await db.select({ key: businessSettings.key, value: businessSettings.value }).from(businessSettings); return Object.fromEntries(rows.map((row) => [row.key, row.value])); }
  catch { return {}; }
}
