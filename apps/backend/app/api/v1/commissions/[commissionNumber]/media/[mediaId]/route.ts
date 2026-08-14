import { and, eq } from "drizzle-orm";
import { authorizeCustomer, authorizeStaff } from "@/modules/auth/authorization";
import { getDb } from "@divine-stone/database";
import { commissionMedia, commissionMilestones, customCommissions, mediaAssets, milestoneMedia } from "@divine-stone/database/schema";
import { getMediaBucket } from "@/modules/storage/media";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ commissionNumber: string; mediaId: string }> }) {
  const customer = await authorizeCustomer(request);
  if (!customer.authorized) return new Response("Unauthorized", { status: customer.status });
  const { commissionNumber, mediaId } = await params;
  const db = getDb();
  const [commission] = await db.select({ id: customCommissions.id, userId: customCommissions.userId }).from(customCommissions).where(eq(customCommissions.commissionNumber, commissionNumber)).limit(1);
  if (!commission) return new Response("Not found", { status: 404 });
  if (commission.userId !== customer.userId) {
    const staff = await authorizeStaff(request);
    if (!staff.authorized) return new Response("Forbidden", { status: 403 });
  }
  const [reference] = await db.select({ storageKey: mediaAssets.storageKey, contentType: mediaAssets.contentType }).from(mediaAssets)
    .innerJoin(commissionMedia, eq(commissionMedia.mediaAssetId, mediaAssets.id))
    .where(and(eq(commissionMedia.commissionId, commission.id), eq(mediaAssets.id, mediaId), eq(mediaAssets.status, "ready"))).limit(1);
  const [milestone] = reference ? [] : await db.select({ storageKey: mediaAssets.storageKey, contentType: mediaAssets.contentType }).from(mediaAssets)
    .innerJoin(milestoneMedia, eq(milestoneMedia.mediaAssetId, mediaAssets.id))
    .innerJoin(commissionMilestones, eq(milestoneMedia.milestoneId, commissionMilestones.id))
    .where(and(eq(commissionMilestones.commissionId, commission.id), eq(mediaAssets.id, mediaId), eq(mediaAssets.status, "ready"))).limit(1);
  const media = reference ?? milestone;
  if (!media) return new Response("Not found", { status: 404 });
  const object = await getMediaBucket().get(media.storageKey);
  if (!object) return new Response("Not found", { status: 404 });
  const headers = new Headers({ "content-type": media.contentType, "cache-control": "private, max-age=3600", "x-content-type-options": "nosniff" });
  if (object.httpEtag) headers.set("etag", object.httpEtag);
  return new Response(object.body, { headers });
}
