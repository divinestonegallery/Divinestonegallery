import { and, eq } from "drizzle-orm";
import { getDb } from "@divine-stone/database";
import { mediaAssets, productMedia, products } from "@divine-stone/database/schema";
import { getMediaBucket } from "@/modules/storage/media";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const [media] = await db
    .select({ storageKey: mediaAssets.storageKey, contentType: mediaAssets.contentType })
    .from(mediaAssets)
    .innerJoin(productMedia, eq(productMedia.mediaAssetId, mediaAssets.id))
    .innerJoin(products, eq(productMedia.productId, products.id))
    .where(and(eq(mediaAssets.id, id), eq(mediaAssets.status, "ready"), eq(products.status, "active")))
    .limit(1);

  if (!media) return new Response("Not found", { status: 404 });
  const object = await getMediaBucket().get(media.storageKey);
  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("content-type", media.contentType);
  headers.set("cache-control", "public, max-age=86400, stale-while-revalidate=604800");
  headers.set("x-content-type-options", "nosniff");
  if (object.httpEtag) headers.set("etag", object.httpEtag);
  return new Response(object.body, { headers });
}
