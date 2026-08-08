import { authorizeStaff } from "@/auth/authorization";
import { updateAdminVariant } from "@/catalog/admin-repository";
import { readJsonObject } from "@/catalog/input";
import { parseVariantPatch } from "@/catalog/variant-input";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeStaff(request);
  if (!authorization.authorized) return Response.json({ error: { code: "STAFF_REQUIRED", message: "Staff access is required." } }, { status: authorization.status });
  const body = await readJsonObject(request);
  if (!body) return Response.json({ error: { code: "INVALID_JSON", message: "A valid variant update is required." } }, { status: 400 });
  const parsed = parseVariantPatch(body);
  if ("error" in parsed) return Response.json({ error: { code: "INVALID_VARIANT", message: parsed.error } }, { status: 400 });
  const { id } = await params;

  try {
    const variant = await updateAdminVariant(id, parsed.value, authorization.userId);
    return variant
      ? Response.json({ data: variant })
      : Response.json({ error: { code: "VARIANT_NOT_FOUND", message: "Variant not found." } }, { status: 404 });
  } catch {
    return Response.json({ error: { code: "VARIANT_UPDATE_FAILED", message: "The variant could not be updated." } }, { status: 409 });
  }
}
