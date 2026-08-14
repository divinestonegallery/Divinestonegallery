import { requireCheckoutCustomer } from "@/modules/checkout/http";
import { readJsonObject } from "@/modules/catalog/input";
import { parseCommissionRequest } from "@/modules/commissions/input";
import { createCommission, listCustomerCommissions } from "@/modules/commissions/repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorization = await requireCheckoutCustomer(request);
  if (authorization instanceof Response) return authorization;
  try { return Response.json({ data: await listCustomerCommissions(authorization.userId) }); }
  catch { return Response.json({ error: { code: "COMMISSIONS_UNAVAILABLE", message: "Commissions could not be loaded." } }, { status: 503 }); }
}

export async function POST(request: Request) {
  const authorization = await requireCheckoutCustomer(request);
  if (authorization instanceof Response) return authorization;
  const body = await readJsonObject(request);
  const input = body ? parseCommissionRequest(body) : null;
  if (!input) return Response.json({ error: { code: "INVALID_COMMISSION", message: "Subject, requirements and a valid Indian delivery postcode are required." } }, { status: 400 });
  try {
    return Response.json({ data: await createCommission(authorization.clerkUserId, authorization.userId, input) }, { status: 201 });
  } catch {
    return Response.json({ error: { code: "COMMISSION_NOT_CREATED", message: "The commission request could not be saved." } }, { status: 503 });
  }
}
