import { authorizeStaff } from "@/modules/auth/authorization";
import { optionalInteger, readJsonObject, requiredString } from "@/modules/catalog/input";
import { findReusableMedia, listAdminMedia, MediaPatch, updateAdminMedia } from "@/modules/cms/media-repository";
import { auditLogs, mediaAssets } from "@divine-stone/database/schema";
import { getDb } from "@divine-stone/database";
import { declaredBodyExceeds } from "@/modules/security/request-limits";
import { validateProductImage } from "@/modules/storage/image-upload";
import { getMediaBucket, publicUrlForMediaKey } from "@/modules/storage/media";

export const dynamic = "force-dynamic";

function nullableString(value: unknown, max: number) {
  if (value === null || value === "" || value === undefined) return null;
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized && normalized.length <= max ? normalized : undefined;
}

function safeFolder(value: unknown) {
  const folder = requiredString(value, 100) ?? "Gallery";
  return folder.replace(/[^a-zA-Z0-9 _-]/g, "").replace(/\s+/g, " ").trim() || "Gallery";
}

function tags(value: unknown) {
  if (!Array.isArray(value) || value.length > 20) return null;
  const normalized = [...new Set(value.map((tag) => typeof tag === "string" ? tag.trim().toLowerCase() : "").filter((tag) => tag && tag.length <= 40))];
  return normalized.length === value.filter(Boolean).length ? JSON.stringify(normalized) : null;
}

async function authorize(request: Request) {
  const result = await authorizeStaff(request);
  if (result.authorized) return result;
  return Response.json({ error: { code: "STAFF_REQUIRED", message: "Staff access is required." } }, { status: result.status });
}

export async function GET(request: Request) {
  const authorization = await authorize(request);
  if (authorization instanceof Response) return authorization;
  try { return Response.json({ data: await listAdminMedia() }); }
  catch { return Response.json({ error: { code: "MEDIA_UNAVAILABLE", message: "Media library could not be loaded." } }, { status: 503 }); }
}

export async function POST(request: Request) {
  const authorization = await authorize(request);
  if (authorization instanceof Response) return authorization;
  if (declaredBodyExceeds(request, 4_200_000)) return Response.json({ error: { code: "UPLOAD_TOO_LARGE", message: "Image upload is too large." } }, { status: 413 });
  let form: FormData;
  try { form = await request.formData(); } catch { return Response.json({ error: { code: "INVALID_UPLOAD", message: "A valid image upload is required." } }, { status: 400 }); }
  const file = form.get("file");
  const altText = nullableString(form.get("altText"), 300);
  const caption = nullableString(form.get("caption"), 500);
  const folder = safeFolder(form.get("folder"));
  if (!(file instanceof File) || altText === undefined || caption === undefined) return Response.json({ error: { code: "INVALID_MEDIA", message: "Choose a valid image and provide accessible details." } }, { status: 400 });
  const image = await validateProductImage(file);
  if (!image) return Response.json({ error: { code: "INVALID_IMAGE", message: "Use a valid optimized JPEG, PNG or WebP image up to 4 MB." } }, { status: 400 });

  const reusable = await findReusableMedia(image.checksumSha256);
  if (reusable) return Response.json({ data: await listAdminMedia(), reusedId: reusable.id }, { status: 200 });

  const mediaId = `media:${crypto.randomUUID()}`;
  const folderKey = folder.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "gallery";
  let storageKey = `library/${folderKey}/${crypto.randomUUID()}.${image.extension}`;
  const bucket = getMediaBucket();
  storageKey = await bucket.put(storageKey, image.bytes, { httpMetadata: { contentType: image.contentType, cacheControl: "public, max-age=31536000, immutable" }, customMetadata: { mediaId, folder } });
  const publicPath = publicUrlForMediaKey(storageKey);
  if (!publicPath) { await bucket.delete(storageKey); return Response.json({ error: { code: "PUBLIC_MEDIA_UNAVAILABLE", message: "ImageKit public media is not configured." } }, { status: 503 }); }
  const db = getDb();
  try {
    await db.batch([
      db.insert(mediaAssets).values({ id: mediaId, uploadedByUserId: authorization.userId, storageKey, publicPath, originalFilename: file.name.slice(0, 255) || `gallery.${image.extension}`, contentType: image.contentType, byteSize: file.size, kind: "image", status: "ready", checksumSha256: image.checksumSha256, altText: altText || null, caption, folder }),
      db.insert(auditLogs).values({ id: crypto.randomUUID(), actorUserId: authorization.userId, action: "media.created", entityType: "media_asset", entityId: mediaId, changesJson: JSON.stringify({ folder, originalFilename: file.name, contentType: image.contentType, byteSize: file.size }) }),
    ]);
  } catch {
    await bucket.delete(storageKey);
    return Response.json({ error: { code: "MEDIA_SAVE_FAILED", message: "The image could not be saved to the library." } }, { status: 503 });
  }
  return Response.json({ data: await listAdminMedia() }, { status: 201 });
}

export async function PATCH(request: Request) {
  const authorization = await authorize(request);
  if (authorization instanceof Response) return authorization;
  const body = await readJsonObject(request);
  const id = body ? requiredString(body.id, 140) : null;
  if (!body || !id) return Response.json({ error: { code: "INVALID_MEDIA", message: "A valid media item is required." } }, { status: 400 });
  const patch: MediaPatch = {};
  if ("altText" in body) { const value = nullableString(body.altText, 300); if (value === undefined) return Response.json({ error: { code: "INVALID_ALT_TEXT", message: "Alt text is too long." } }, { status: 400 }); patch.altText = value; }
  if ("caption" in body) { const value = nullableString(body.caption, 500); if (value === undefined) return Response.json({ error: { code: "INVALID_CAPTION", message: "Caption is too long." } }, { status: 400 }); patch.caption = value; }
  if ("folder" in body) patch.folder = safeFolder(body.folder);
  if ("tags" in body) { const value = tags(body.tags); if (value === null) return Response.json({ error: { code: "INVALID_TAGS", message: "Use up to 20 short tags." } }, { status: 400 }); patch.tagsJson = value; }
  if ("focalPointX" in body) { const value = optionalInteger(body.focalPointX, 0); if (value === null || value === undefined || value > 100) return Response.json({ error: { code: "INVALID_FOCAL_POINT", message: "Focal point must be between 0 and 100." } }, { status: 400 }); patch.focalPointX = value; }
  if ("focalPointY" in body) { const value = optionalInteger(body.focalPointY, 0); if (value === null || value === undefined || value > 100) return Response.json({ error: { code: "INVALID_FOCAL_POINT", message: "Focal point must be between 0 and 100." } }, { status: 400 }); patch.focalPointY = value; }
  if ("status" in body) { if (body.status !== "ready" && body.status !== "deleted") return Response.json({ error: { code: "INVALID_STATUS", message: "Media status is invalid." } }, { status: 400 }); patch.status = body.status; }
  if (!Object.keys(patch).length) return Response.json({ error: { code: "EMPTY_UPDATE", message: "No media changes were supplied." } }, { status: 400 });
  try { return Response.json({ data: await updateAdminMedia(id, patch, authorization.userId) }); }
  catch { return Response.json({ error: { code: "MEDIA_UPDATE_FAILED", message: "The media item could not be updated." } }, { status: 409 }); }
}
