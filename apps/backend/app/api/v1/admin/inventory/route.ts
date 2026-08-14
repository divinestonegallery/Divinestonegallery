import { authorizeStaff } from "@/modules/auth/authorization";
import { updateAdminVariant } from "@/modules/catalog/admin-repository";
import { inventorySummary, listAdminInventory } from "@/modules/catalog/inventory-repository";
import { optionalInteger, readJsonObject, requiredString } from "@/modules/catalog/input";

export const dynamic = "force-dynamic";

async function authorize(request: Request) {
  const result = await authorizeStaff(request);
  if (result.authorized) return result;
  return Response.json({ error: { code: "STAFF_REQUIRED", message: "Staff access is required." } }, { status: result.status });
}

export async function GET(request: Request) {
  const authorization = await authorize(request);
  if (authorization instanceof Response) return authorization;
  try {
    const data = await listAdminInventory();
    return Response.json({ data, summary: inventorySummary(data) });
  } catch {
    return Response.json({ error: { code: "INVENTORY_UNAVAILABLE", message: "Inventory could not be loaded." } }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  const authorization = await authorize(request);
  if (authorization instanceof Response) return authorization;
  const body = await readJsonObject(request);
  if (!body) return Response.json({ error: { code: "INVALID_JSON", message: "A valid inventory update is required." } }, { status: 400 });
  const id = requiredString(body.id, 120);
  if (!id) return Response.json({ error: { code: "INVALID_VARIANT", message: "A valid variant is required." } }, { status: 400 });

  const patch: { stockQuantity?: number; lowStockThreshold?: number; isActive?: boolean } = {};
  if ("stockQuantity" in body) { const value = optionalInteger(body.stockQuantity, 0); if (value === null || value === undefined) return Response.json({ error: { code: "INVALID_STOCK", message: "Stock must be zero or greater." } }, { status: 400 }); patch.stockQuantity = value; }
  if ("lowStockThreshold" in body) { const value = optionalInteger(body.lowStockThreshold, 0); if (value === null || value === undefined) return Response.json({ error: { code: "INVALID_THRESHOLD", message: "Low-stock alert must be zero or greater." } }, { status: 400 }); patch.lowStockThreshold = value; }
  if ("isActive" in body) { if (typeof body.isActive !== "boolean") return Response.json({ error: { code: "INVALID_STATUS", message: "Variant status must be true or false." } }, { status: 400 }); patch.isActive = body.isActive; }
  if (!Object.keys(patch).length) return Response.json({ error: { code: "EMPTY_UPDATE", message: "No inventory changes were supplied." } }, { status: 400 });

  try {
    const variant = await updateAdminVariant(id, patch, authorization.userId);
    if (!variant) return Response.json({ error: { code: "VARIANT_NOT_FOUND", message: "Variant not found." } }, { status: 404 });
    const data = await listAdminInventory();
    return Response.json({ data, summary: inventorySummary(data) });
  } catch {
    return Response.json({ error: { code: "INVENTORY_UPDATE_FAILED", message: "Inventory could not be updated." } }, { status: 409 });
  }
}
