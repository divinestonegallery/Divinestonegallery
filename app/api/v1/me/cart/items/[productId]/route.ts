import { requiredString } from "@/catalog/input";
import { collectionUnavailable, requireCustomer } from "@/collections/http";
import { readCustomerCollections, removeBagProduct } from "@/collections/repository";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ productId: string }> },
) {
  const authorization = await requireCustomer(request);
  if (authorization instanceof Response) return authorization;
  const productId = requiredString((await context.params).productId, 160);
  if (!productId) {
    return Response.json(
      { error: { code: "INVALID_PRODUCT", message: "A valid product is required." } },
      { status: 400 },
    );
  }

  try {
    await removeBagProduct(authorization.clerkUserId, productId);
    const collections = await readCustomerCollections(authorization.clerkUserId);
    return Response.json({ data: { productIds: collections.bagProductIds } });
  } catch {
    return collectionUnavailable();
  }
}
