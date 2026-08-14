import {
  collectionUnavailable,
  readProductMutation,
  requireCustomer,
} from "@/modules/collections/http";
import {
  addWishlistProduct,
  clearWishlist,
  readCustomerCollections,
} from "@/modules/collections/repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorization = await requireCustomer(request);
  if (authorization instanceof Response) return authorization;

  try {
    const collections = await readCustomerCollections(authorization.clerkUserId);
    return Response.json({ data: { productIds: collections.wishlistProductIds } });
  } catch {
    return collectionUnavailable();
  }
}

export async function PUT(request: Request) {
  const authorization = await requireCustomer(request);
  if (authorization instanceof Response) return authorization;
  const item = await readProductMutation(request);
  if (!item) {
    return Response.json(
      { error: { code: "INVALID_PRODUCT", message: "A valid product is required." } },
      { status: 400 },
    );
  }

  try {
    const added = await addWishlistProduct(
      authorization.clerkUserId,
      item.productId,
      item.variantId,
    );
    if (!added) {
      return Response.json(
        { error: { code: "PRODUCT_UNAVAILABLE", message: "This work is not currently available." } },
        { status: 409 },
      );
    }
    const collections = await readCustomerCollections(authorization.clerkUserId);
    return Response.json({ data: { productIds: collections.wishlistProductIds } });
  } catch {
    return collectionUnavailable();
  }
}

export async function DELETE(request: Request) {
  const authorization = await requireCustomer(request);
  if (authorization instanceof Response) return authorization;

  try {
    await clearWishlist(authorization.clerkUserId);
    return Response.json({ data: { productIds: [] } });
  } catch {
    return collectionUnavailable();
  }
}
