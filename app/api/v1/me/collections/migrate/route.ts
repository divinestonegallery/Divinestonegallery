import { readJsonObject } from "@/catalog/input";
import {
  collectionUnavailable,
  readProductIdList,
  requireCustomer,
} from "@/collections/http";
import { mergeDeviceCollections } from "@/collections/repository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const authorization = await requireCustomer(request);
  if (authorization instanceof Response) return authorization;

  const body = await readJsonObject(request);
  const wishlistProductIds = readProductIdList(body?.wishlistProductIds);
  const bagProductIds = readProductIdList(body?.bagProductIds);
  const uniqueProductCount = wishlistProductIds && bagProductIds
    ? new Set([...wishlistProductIds, ...bagProductIds]).size
    : 0;
  if (!body || !wishlistProductIds || !bagProductIds || uniqueProductCount > 100) {
    return Response.json(
      { error: { code: "INVALID_COLLECTIONS", message: "Valid saved-item lists are required." } },
      { status: 400 },
    );
  }

  try {
    const data = await mergeDeviceCollections(
      authorization.clerkUserId,
      wishlistProductIds,
      bagProductIds,
    );
    return Response.json({ data });
  } catch {
    return collectionUnavailable();
  }
}
