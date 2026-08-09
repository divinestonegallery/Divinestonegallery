import { authorizeStaff } from "@/auth/authorization";
import { getAdminProduct, ProductPatch, setAdminProductCollections, updateAdminProduct } from "@/catalog/admin-repository";
import { enumValue, optionalInteger, optionalString, readJsonObject, requiredString, slugValue } from "@/catalog/input";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeStaff(request);
  if (!authorization.authorized) return Response.json({ error: { code: "STAFF_REQUIRED", message: "Staff access is required." } }, { status: authorization.status });
  const { id } = await params;
  const item = await getAdminProduct(id);
  return item
    ? Response.json({ data: item })
    : Response.json({ error: { code: "PRODUCT_NOT_FOUND", message: "Product not found." } }, { status: 404 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeStaff(request);
  if (!authorization.authorized) return Response.json({ error: { code: "STAFF_REQUIRED", message: "Staff access is required." } }, { status: authorization.status });
  const body = await readJsonObject(request);
  if (!body) return Response.json({ error: { code: "INVALID_JSON", message: "A valid update is required." } }, { status: 400 });

  const patch: ProductPatch = {};
  if ("name" in body) { const value = requiredString(body.name, 180); if (!value) return Response.json({ error: { code: "INVALID_NAME", message: "A valid name is required." } }, { status: 400 }); patch.name = value; }
  if ("slug" in body) { const value = slugValue(body.slug); if (!value) return Response.json({ error: { code: "INVALID_SLUG", message: "A valid slug is required." } }, { status: 400 }); patch.slug = value; }
  if ("shortDescription" in body) patch.shortDescription = optionalString(body.shortDescription, 500);
  if ("description" in body) patch.description = optionalString(body.description, 5000) ?? "";
  if ("categoryId" in body) patch.categoryId = optionalString(body.categoryId, 100);
  if ("deityId" in body) patch.deityId = optionalString(body.deityId, 100);
  if ("productType" in body) { const value = enumValue(body.productType, ["ready_made", "made_to_order"] as const); if (!value) return Response.json({ error: { code: "INVALID_PRODUCT_TYPE", message: "Product type is invalid." } }, { status: 400 }); patch.productType = value; }
  if ("salesMode" in body) { const value = enumValue(body.salesMode, ["direct", "quote", "both"] as const); if (!value) return Response.json({ error: { code: "INVALID_SALES_MODE", message: "Sales mode is invalid." } }, { status: 400 }); patch.salesMode = value; }
  if ("status" in body) { const value = enumValue(body.status, ["draft", "active", "archived"] as const); if (!value) return Response.json({ error: { code: "INVALID_STATUS", message: "Status is invalid." } }, { status: 400 }); patch.status = value; }
  if ("isFeatured" in body) { if (typeof body.isFeatured !== "boolean") return Response.json({ error: { code: "INVALID_FEATURED", message: "Featured must be true or false." } }, { status: 400 }); patch.isFeatured = body.isFeatured; }
  if ("sortOrder" in body) { const value = optionalInteger(body.sortOrder, 0); if (value === undefined || value === null) return Response.json({ error: { code: "INVALID_SORT_ORDER", message: "Sort order must be zero or greater." } }, { status: 400 }); patch.sortOrder = value; }
  if ("seoTitle" in body) patch.seoTitle = optionalString(body.seoTitle, 180);
  if ("seoDescription" in body) patch.seoDescription = optionalString(body.seoDescription, 320);

  let collectionIds: string[] | undefined;
  if ("collectionIds" in body) {
    if (!Array.isArray(body.collectionIds) || body.collectionIds.some((value) => typeof value !== "string" || !value.trim())) {
      return Response.json({ error: { code: "INVALID_COLLECTIONS", message: "Collections must be a list of valid collection IDs." } }, { status: 400 });
    }
    collectionIds = [...new Set(body.collectionIds.map((value) => value.trim()))].slice(0, 30);
  }

  if (!Object.keys(patch).length && collectionIds === undefined) return Response.json({ error: { code: "EMPTY_UPDATE", message: "No valid changes were supplied." } }, { status: 400 });

  const { id } = await params;
  try {
    let item = Object.keys(patch).length
      ? await updateAdminProduct(id, patch, authorization.userId)
      : await getAdminProduct(id);
    if (item && collectionIds !== undefined) {
      item = await setAdminProductCollections(id, collectionIds, authorization.userId);
    }
    return item
      ? Response.json({ data: item })
      : Response.json({ error: { code: "PRODUCT_NOT_FOUND", message: "Product not found." } }, { status: 404 });
  } catch {
    return Response.json({ error: { code: "PRODUCT_UPDATE_FAILED", message: "The product could not be updated." } }, { status: 409 });
  }
}
