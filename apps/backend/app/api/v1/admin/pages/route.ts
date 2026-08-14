import { authorizeStaff } from "@/modules/auth/authorization";
import { enumValue, optionalInteger, readJsonObject, requiredString, slugValue } from "@/modules/catalog/input";
import {
  createAdminSitePage,
  createAdminSiteSection,
  duplicateAdminSiteSection,
  listAdminSitePages,
  NewSiteSection,
  SitePagePatch,
  SiteSectionPatch,
  updateAdminSitePage,
  updateAdminSiteSection,
} from "@/modules/cms/admin-repository";

export const dynamic = "force-dynamic";

const blockTypes = ["hero", "rich_text", "image_text", "collection", "feature_grid", "callout", "faq"] as const;

function nullableString(value: unknown, max: number) {
  if (value === null || value === "" || value === undefined) return null;
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized && normalized.length <= max ? normalized : undefined;
}

function safeHref(value: unknown) {
  const href = nullableString(value, 500);
  if (href === null || href === undefined) return href;
  return /^(\/|https:\/\/|mailto:|tel:)/.test(href) ? href : undefined;
}

function contentJson(value: unknown) {
  if (value === undefined || value === null || value === "") return "[]";
  if (typeof value !== "string" || value.length > 20_000) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) && parsed.length <= 30 ? JSON.stringify(parsed) : null;
  } catch { return null; }
}

async function authorize(request: Request) {
  const result = await authorizeStaff(request);
  if (result.authorized) return result;
  return Response.json({ error: { code: "STAFF_REQUIRED", message: "Staff access is required." } }, { status: result.status });
}

export async function GET(request: Request) {
  const authorization = await authorize(request);
  if (authorization instanceof Response) return authorization;
  try { return Response.json({ data: await listAdminSitePages() }); }
  catch { return Response.json({ error: { code: "PAGES_UNAVAILABLE", message: "Website pages could not be loaded." } }, { status: 503 }); }
}

export async function POST(request: Request) {
  const authorization = await authorize(request);
  if (authorization instanceof Response) return authorization;
  const body = await readJsonObject(request);
  if (!body) return Response.json({ error: { code: "INVALID_JSON", message: "Valid page details are required." } }, { status: 400 });
  const entity = enumValue(body.entity, ["page", "section", "duplicate_section"] as const);
  try {
    if (entity === "page") {
      const title = requiredString(body.title, 180);
      const navigationTitle = nullableString(body.navigationTitle, 100);
      const seoTitle = nullableString(body.seoTitle, 180);
      const seoDescription = nullableString(body.seoDescription, 320);
      if (!title || navigationTitle === undefined || seoTitle === undefined || seoDescription === undefined) throw new Error("INVALID");
      return Response.json({ data: await createAdminSitePage({ title, navigationTitle, seoTitle, seoDescription }, authorization.userId) }, { status: 201 });
    }
    if (entity === "duplicate_section") {
      const id = requiredString(body.id, 140);
      if (!id) throw new Error("INVALID");
      return Response.json({ data: await duplicateAdminSiteSection(id, authorization.userId) }, { status: 201 });
    }
    if (entity === "section") {
      const pageId = requiredString(body.pageId, 140);
      const sectionKey = slugValue(body.sectionKey);
      const blockType = enumValue(body.blockType, blockTypes);
      const sortOrder = optionalInteger(body.sortOrder, 0);
      const parsedContent = contentJson(body.contentJson);
      const mediaPosition = enumValue(body.mediaPosition, ["left", "right", "background"] as const) ?? "right";
      const input: NewSiteSection = {
        pageId: pageId!, sectionKey: sectionKey!, blockType: blockType!,
        eyebrow: nullableString(body.eyebrow, 180)!, heading: nullableString(body.heading, 300)!, body: nullableString(body.body, 5000)!,
        ctaLabel: nullableString(body.ctaLabel, 100)!, ctaHref: safeHref(body.ctaHref)!, secondaryCtaLabel: nullableString(body.secondaryCtaLabel, 100)!, secondaryCtaHref: safeHref(body.secondaryCtaHref)!,
        mediaAssetId: nullableString(body.mediaAssetId, 140)!, mediaPosition, contentJson: parsedContent!, styleVariant: requiredString(body.styleVariant, 50) ?? "light", sortOrder: sortOrder ?? 0, isVisible: typeof body.isVisible === "boolean" ? body.isVisible : true,
      };
      if (!pageId || !sectionKey || !blockType || sortOrder === undefined || parsedContent === null || Object.values(input).some((value) => value === undefined)) throw new Error("INVALID");
      return Response.json({ data: await createAdminSiteSection(input, authorization.userId) }, { status: 201 });
    }
    throw new Error("INVALID");
  } catch {
    return Response.json({ error: { code: "PAGE_CREATE_FAILED", message: "The page or section could not be created. Check links and content." } }, { status: 409 });
  }
}

export async function PATCH(request: Request) {
  const authorization = await authorize(request);
  if (authorization instanceof Response) return authorization;
  const body = await readJsonObject(request);
  if (!body) return Response.json({ error: { code: "INVALID_JSON", message: "A valid update is required." } }, { status: 400 });
  const entity = enumValue(body.entity, ["page", "section"] as const);
  const id = requiredString(body.id, 140);
  if (!entity || !id) return Response.json({ error: { code: "INVALID_TARGET", message: "A valid page or section is required." } }, { status: 400 });
  try {
    if (entity === "page") {
      const patch: SitePagePatch = {};
      if ("title" in body) { const value = requiredString(body.title, 180); if (!value) throw new Error("INVALID"); patch.title = value; }
      if ("navigationTitle" in body) { const value = nullableString(body.navigationTitle, 100); if (value === undefined) throw new Error("INVALID"); patch.navigationTitle = value; }
      if ("seoTitle" in body) { const value = nullableString(body.seoTitle, 180); if (value === undefined) throw new Error("INVALID"); patch.seoTitle = value; }
      if ("seoDescription" in body) { const value = nullableString(body.seoDescription, 320); if (value === undefined) throw new Error("INVALID"); patch.seoDescription = value; }
      if ("status" in body) { const value = enumValue(body.status, ["draft", "published", "archived"] as const); if (!value) throw new Error("INVALID"); patch.status = value; }
      if (!Object.keys(patch).length) throw new Error("EMPTY");
      return Response.json({ data: await updateAdminSitePage(id, patch, authorization.userId) });
    }

    const patch: SiteSectionPatch = {};
    if ("sectionKey" in body) { const value = slugValue(body.sectionKey); if (!value) throw new Error("INVALID"); patch.sectionKey = value; }
    if ("blockType" in body) { const value = enumValue(body.blockType, blockTypes); if (!value) throw new Error("INVALID"); patch.blockType = value; }
    for (const [key, max] of [["eyebrow", 180], ["heading", 300], ["body", 5000], ["ctaLabel", 100], ["secondaryCtaLabel", 100], ["mediaAssetId", 140]] as const) {
      if (key in body) { const value = nullableString(body[key], max); if (value === undefined) throw new Error("INVALID"); patch[key] = value; }
    }
    for (const key of ["ctaHref", "secondaryCtaHref"] as const) { if (key in body) { const value = safeHref(body[key]); if (value === undefined) throw new Error("INVALID"); patch[key] = value; } }
    if ("mediaPosition" in body) { const value = enumValue(body.mediaPosition, ["left", "right", "background"] as const); if (!value) throw new Error("INVALID"); patch.mediaPosition = value; }
    if ("contentJson" in body) { const value = contentJson(body.contentJson); if (value === null) throw new Error("INVALID"); patch.contentJson = value; }
    if ("styleVariant" in body) { const value = enumValue(body.styleVariant, ["light", "warm", "dark", "soft"] as const); if (!value) throw new Error("INVALID"); patch.styleVariant = value; }
    if ("sortOrder" in body) { const value = optionalInteger(body.sortOrder, 0); if (value === undefined || value === null) throw new Error("INVALID"); patch.sortOrder = value; }
    if ("isVisible" in body) { if (typeof body.isVisible !== "boolean") throw new Error("INVALID"); patch.isVisible = body.isVisible; }
    if (!Object.keys(patch).length) throw new Error("EMPTY");
    return Response.json({ data: await updateAdminSiteSection(id, patch, authorization.userId) });
  } catch {
    return Response.json({ error: { code: "PAGE_UPDATE_FAILED", message: "The page content could not be updated. Check links, content and unique keys." } }, { status: 409 });
  }
}
