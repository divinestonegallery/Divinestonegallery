import { requireCheckoutCustomer } from "@/checkout/http";
import { getCustomerCommission } from "@/commissions/repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ commissionNumber: string }> }) {
  const authorization = await requireCheckoutCustomer(request);
  if (authorization instanceof Response) return authorization;
  const { commissionNumber } = await params;
  try {
    const item = await getCustomerCommission(authorization.userId, commissionNumber);
    return item ? Response.json({ data: item }) : Response.json({ error: { code: "COMMISSION_NOT_FOUND", message: "Commission not found." } }, { status: 404 });
  } catch { return Response.json({ error: { code: "COMMISSION_UNAVAILABLE", message: "Commission could not be loaded." } }, { status: 503 }); }
}
