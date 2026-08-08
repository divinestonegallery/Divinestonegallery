import { authorizeStaff } from "@/auth/authorization";
import {
  createAdminProduct,
  listAdminProducts,
  listCatalogLookups,
} from "@/catalog/admin-repository";
import {
  enumValue,
  optionalString,
  readJsonObject,
  requiredString,
  slugValue,
} from "@/catalog/input";

export const dynamic = "force-dynamic";

async function staff(request: Request) {
  const result = await authorizeStaff(request);
  if (result.authorized) return result;
  return Response.json(
    { error: { code: result.status === 401 ? "AUTH_REQUIRED" : "STAFF_REQUIRED", message: "Staff access is required." } },
    { status: result.status },
  );
}

export async function GET(request: Request) {
  const authorization = await staff(request);
  if (authorization instanceof Response) return authorization;

  try {
    const [items, lookups] = await Promise.all([listAdminProducts(), listCatalogLookups()]);
    return Response.json({ data: items, lookups });
  } catch {
    return Response.json(
      { error: { code: "CATALOG_UNAVAILABLE", message: "The catalogue could not be loaded." } },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  const authorization = await staff(request);
  if (authorization instanceof Response) return authorization;
  const body = await readJsonObject(request);
  if (!body) return Response.json({ error: { code: "INVALID_JSON", message: "A valid product is required." } }, { status: 400 });

  const name = requiredString(body.name, 180);
  const slug = slugValue(body.slug);
  const description = optionalString(body.description, 5000) ?? "";
  const shortDescription = optionalString(body.shortDescription, 500);
  const categoryId = optionalString(body.categoryId, 100);
  const deityId = optionalString(body.deityId, 100);
  const productType = enumValue(body.productType, ["ready_made", "made_to_order"] as const) ?? "ready_made";
  const salesMode = enumValue(body.salesMode, ["direct", "quote", "both"] as const) ?? "both";

  if (!name || !slug) {
    return Response.json(
      { error: { code: "INVALID_PRODUCT", message: "Name and a valid URL slug are required." } },
      { status: 400 },
    );
  }

  try {
    const item = await createAdminProduct(
      { name, slug, description, shortDescription, categoryId, deityId, productType, salesMode },
      authorization.userId,
    );
    return Response.json({ data: item }, { status: 201 });
  } catch {
    return Response.json(
      { error: { code: "PRODUCT_CONFLICT", message: "This slug or product information is already in use." } },
      { status: 409 },
    );
  }
}
