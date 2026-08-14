import { authorizeStaff } from "@/modules/auth/authorization";
import { readJsonObject } from "@/modules/catalog/input";
import { parseCommissionPatch } from "@/modules/commissions/input";
import { getCommissionById, updateCommission } from "@/modules/commissions/repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeStaff(request);
  if (!authorization.authorized) return Response.json({ error: { code: "STAFF_REQUIRED", message: "Staff access is required." } }, { status: authorization.status });
  const item = await getCommissionById((await params).id);
  return item ? Response.json({ data: item }) : Response.json({ error: { code: "COMMISSION_NOT_FOUND", message: "Commission not found." } }, { status: 404 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeStaff(request);
  if (!authorization.authorized) return Response.json({ error: { code: "STAFF_REQUIRED", message: "Staff access is required." } }, { status: authorization.status });
  const body = await readJsonObject(request);
  const input = body ? parseCommissionPatch(body) : null;
  if (!input) return Response.json({ error: { code: "INVALID_COMMISSION_UPDATE", message: "Enter a valid status or complete quotation." } }, { status: 400 });
  const patch: Record<string, unknown> = {};
  if (input.status) patch.status = input.status;
  if (input.financial) Object.assign(patch, { quotedPricePaise: input.quotedPricePaise, gstPaise: input.gstPaise, shippingPaise: input.shippingPaise, advanceAmountPaise: input.advanceAmountPaise, balanceAmountPaise: input.balanceAmountPaise });
  if (input.expectedCompletionAt !== null) patch.expectedCompletionAt = input.expectedCompletionAt;
  try {
    const item = await updateCommission((await params).id, patch, authorization.userId);
    return item ? Response.json({ data: item }) : Response.json({ error: { code: "COMMISSION_NOT_FOUND", message: "Commission not found." } }, { status: 404 });
  } catch { return Response.json({ error: { code: "COMMISSION_NOT_UPDATED", message: "The commission could not be updated." } }, { status: 503 }); }
}
