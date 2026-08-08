import { and, eq } from "drizzle-orm";
import { authorizeStaff } from "@/auth/authorization";
import { getDb } from "@/db";
import { auditLogs, mediaAssets, productMedia, products } from "@/db/schema";
import { getMediaBucket } from "@/storage/media";
import { validateProductImage } from "@/storage/image-upload";
import { declaredBodyExceeds } from "@/security/request-limits";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeStaff(request);
  if (!authorization.authorized) return Response.json({ error: { code: "STAFF_REQUIRED", message: "Staff access is required." } }, { status: authorization.status });
  const { id: productId } = await params;
  if (declaredBodyExceeds(request, 4_200_000)) return Response.json({ error: { code: "UPLOAD_TOO_LARGE", message: "Image upload is too large." } }, { status: 413 });

  let form: FormData;
  try { form = await request.formData(); } catch { return Response.json({ error: { code: "INVALID_UPLOAD", message: "A valid image upload is required." } }, { status: 400 }); }
  const file = form.get("file");
  const altText = typeof form.get("altText") === "string" ? String(form.get("altText")).trim().slice(0, 300) : "";
  if (!(file instanceof File)) return Response.json({ error: { code: "IMAGE_REQUIRED", message: "Choose a JPEG, PNG or WebP image." } }, { status: 400 });
  const image = await validateProductImage(file);
  if (!image) return Response.json({ error: { code: "INVALID_IMAGE", message: "Use a valid optimized JPEG, PNG or WebP image up to 4 MB." } }, { status: 400 });

  const db = getDb();
  const [product] = await db.select({ id: products.id, name: products.name }).from(products).where(eq(products.id, productId)).limit(1);
  if (!product) return Response.json({ error: { code: "PRODUCT_NOT_FOUND", message: "Product not found." } }, { status: 404 });

  const mediaId = `media:${crypto.randomUUID()}`;
  const safeProductId = productId.replace(/[^a-zA-Z0-9_-]/g, "_");
  const storageKey = `products/${safeProductId}/${crypto.randomUUID()}.${image.extension}`;
  const bucket = getMediaBucket();
  await bucket.put(storageKey, image.bytes, {
    httpMetadata: { contentType: image.contentType, cacheControl: "public, max-age=31536000, immutable" },
    customMetadata: { productId, mediaId },
  });

  try {
    const [primary] = await db.select({ id: productMedia.mediaAssetId }).from(productMedia).where(and(eq(productMedia.productId, productId), eq(productMedia.isPrimary, true))).limit(1);
    await db.batch([
      db.insert(mediaAssets).values({
        id: mediaId,
        uploadedByUserId: authorization.userId,
        storageKey,
        originalFilename: file.name.slice(0, 255) || `product.${image.extension}`,
        contentType: image.contentType,
        byteSize: file.size,
        kind: "image",
        status: "ready",
        checksumSha256: image.checksumSha256,
        altText: altText || `${product.name} hand-carved marble work`,
      }),
      db.insert(productMedia).values({ productId, mediaAssetId: mediaId, sortOrder: primary ? 999 : 1, isPrimary: !primary }),
      db.insert(auditLogs).values({
        id: crypto.randomUUID(),
        actorUserId: authorization.userId,
        action: "product_media.created",
        entityType: "product_media",
        entityId: mediaId,
        changesJson: JSON.stringify({ productId, storageKey, contentType: image.contentType, byteSize: file.size }),
      }),
    ]);
  } catch {
    await bucket.delete(storageKey);
    return Response.json({ error: { code: "MEDIA_SAVE_FAILED", message: "The image could not be attached to the product." } }, { status: 503 });
  }

  return Response.json({ data: { id: mediaId, url: `/api/v1/media/${encodeURIComponent(mediaId)}` } }, { status: 201 });
}
