import { asc, eq, sql } from "drizzle-orm";
import { auditLogs, mediaAssets, sitePages, siteSections } from "@/db/schema";

async function database() {
  const { getDb } = await import("@/db");
  return getDb();
}

export async function listAdminSitePages() {
  const db = await database();
  const [pageRows, sectionRows, mediaRows] = await Promise.all([
    db.select().from(sitePages).orderBy(asc(sitePages.title)),
    db.select({
      id: siteSections.id,
      pageId: siteSections.pageId,
      sectionKey: siteSections.sectionKey,
      blockType: siteSections.blockType,
      eyebrow: siteSections.eyebrow,
      heading: siteSections.heading,
      body: siteSections.body,
      ctaLabel: siteSections.ctaLabel,
      ctaHref: siteSections.ctaHref,
      secondaryCtaLabel: siteSections.secondaryCtaLabel,
      secondaryCtaHref: siteSections.secondaryCtaHref,
      mediaAssetId: siteSections.mediaAssetId,
      mediaPath: mediaAssets.publicPath,
      mediaAltText: mediaAssets.altText,
      mediaPosition: siteSections.mediaPosition,
      contentJson: siteSections.contentJson,
      styleVariant: siteSections.styleVariant,
      sortOrder: siteSections.sortOrder,
      isVisible: siteSections.isVisible,
      createdAt: siteSections.createdAt,
      updatedAt: siteSections.updatedAt,
    }).from(siteSections)
      .leftJoin(mediaAssets, eq(siteSections.mediaAssetId, mediaAssets.id))
      .orderBy(asc(siteSections.pageId), asc(siteSections.sortOrder)),
    db.select({ id: mediaAssets.id, publicPath: mediaAssets.publicPath, altText: mediaAssets.altText, originalFilename: mediaAssets.originalFilename }).from(mediaAssets)
      .where(eq(mediaAssets.status, "ready")).orderBy(asc(mediaAssets.originalFilename)),
  ]);
  return {
    pages: pageRows.map((page) => ({ ...page, sections: sectionRows.filter((section) => section.pageId === page.id) })),
    media: mediaRows.filter((item) => item.publicPath),
  };
}

export type NewSitePage = {
  title: string;
  slug: string;
  navigationTitle: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

export async function createAdminSitePage(input: NewSitePage, actorUserId: string) {
  const db = await database();
  const id = `page:${crypto.randomUUID()}`;
  await db.batch([
    db.insert(sitePages).values({ id, ...input, status: "draft", isSystem: false }),
    db.insert(auditLogs).values({ id: crypto.randomUUID(), actorUserId, action: "site_page.created", entityType: "site_page", entityId: id, changesJson: JSON.stringify(input) }),
  ]);
  return listAdminSitePages();
}

export type SitePagePatch = Partial<NewSitePage & {
  status: "draft" | "published" | "archived";
}>;

export async function updateAdminSitePage(id: string, patch: SitePagePatch, actorUserId: string) {
  const db = await database();
  await db.batch([
    db.update(sitePages).set({
      ...patch,
      ...(patch.status === "published" ? { publishedAt: sql`coalesce(${sitePages.publishedAt}, extract(epoch from now())::integer)` } : {}),
      updatedAt: sql`(extract(epoch from now())::integer)`,
    }).where(eq(sitePages.id, id)),
    db.insert(auditLogs).values({ id: crypto.randomUUID(), actorUserId, action: "site_page.updated", entityType: "site_page", entityId: id, changesJson: JSON.stringify(patch) }),
  ]);
  return listAdminSitePages();
}

export type NewSiteSection = {
  pageId: string;
  sectionKey: string;
  blockType: "hero" | "rich_text" | "image_text" | "collection" | "feature_grid" | "callout" | "faq";
  eyebrow: string | null;
  heading: string | null;
  body: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  secondaryCtaLabel: string | null;
  secondaryCtaHref: string | null;
  mediaAssetId: string | null;
  mediaPosition: "left" | "right" | "background";
  contentJson: string;
  styleVariant: string;
  sortOrder: number;
  isVisible: boolean;
};

export async function createAdminSiteSection(input: NewSiteSection, actorUserId: string) {
  const db = await database();
  const id = `section:${crypto.randomUUID()}`;
  await db.batch([
    db.insert(siteSections).values({ id, ...input }),
    db.insert(auditLogs).values({ id: crypto.randomUUID(), actorUserId, action: "site_section.created", entityType: "site_section", entityId: id, changesJson: JSON.stringify(input) }),
  ]);
  return listAdminSitePages();
}

export type SiteSectionPatch = Partial<Omit<NewSiteSection, "pageId">>;

export async function updateAdminSiteSection(id: string, patch: SiteSectionPatch, actorUserId: string) {
  const db = await database();
  await db.batch([
    db.update(siteSections).set({ ...patch, updatedAt: sql`(extract(epoch from now())::integer)` }).where(eq(siteSections.id, id)),
    db.insert(auditLogs).values({ id: crypto.randomUUID(), actorUserId, action: "site_section.updated", entityType: "site_section", entityId: id, changesJson: JSON.stringify(patch) }),
  ]);
  return listAdminSitePages();
}

export async function duplicateAdminSiteSection(id: string, actorUserId: string) {
  const db = await database();
  const [source] = await db.select().from(siteSections).where(eq(siteSections.id, id)).limit(1);
  if (!source) throw new Error("SECTION_NOT_FOUND");
  const copyId = `section:${crypto.randomUUID()}`;
  const copyKey = `${source.sectionKey}-copy-${crypto.randomUUID().slice(0, 5)}`;
  await db.batch([
    db.insert(siteSections).values({
      ...source,
      id: copyId,
      sectionKey: copyKey,
      heading: source.heading ? `${source.heading} (copy)` : null,
      sortOrder: source.sortOrder + 1,
      isVisible: false,
      createdAt: sql`(extract(epoch from now())::integer)`,
      updatedAt: sql`(extract(epoch from now())::integer)`,
    }),
    db.insert(auditLogs).values({ id: crypto.randomUUID(), actorUserId, action: "site_section.duplicated", entityType: "site_section", entityId: copyId, changesJson: JSON.stringify({ sourceId: id }) }),
  ]);
  return listAdminSitePages();
}
