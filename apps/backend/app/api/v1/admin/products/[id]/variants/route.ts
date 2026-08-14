import { authorizeStaff } from "@/modules/auth/authorization";
import { createAdminVariant } from "@/modules/catalog/admin-repository";
import { readJsonObject } from "@/modules/catalog/input";
import { parseNewVariant } from "@/modules/catalog/variant-input";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeStaff(request);
  if (!authorization.authorized) return Response.json({ error: { code: "STAFF_REQUIRED", message: "Staff access is required." } }, { status: authorization.status });
  const body = await readJsonObject(request);
  if (!body) return Response.json({ error: { code: "INVALID_JSON", message: "A valid variant is required." } }, { status: 400 });
  const parsed = parseNewVariant(body);
  if ("error" in parsed) return Response.json({ error: { code: "INVALID_VARIANT", message: parsed.error } }, { status: 400 });
  const { id } = await params;

  try {
    const variantId = await createAdminVariant(id, parsed.value, authorization.userId);
    return Response.json({ data: { id: variantId } }, { status: 201 });
  } catch {
    return Response.json({ error: { code: "VARIANT_CONFLICT", message: "The variant could not be created. Check the product and SKU." } }, { status: 409 });
  }
}
