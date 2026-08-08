import { readJsonObject } from "@/catalog/input";
import { requireCheckoutCustomer } from "@/checkout/http";
import { parseMilestoneDecision } from "@/commissions/input";
import { decideMilestone } from "@/commissions/repository";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ commissionNumber: string; id: string }> }) {
  const authorization = await requireCheckoutCustomer(request);
  if (authorization instanceof Response) return authorization;
  const { commissionNumber, id } = await params;
  const body = await readJsonObject(request) ?? {};
  try {
    const item = await decideMilestone(authorization.userId, commissionNumber, id, "approved", parseMilestoneDecision(body).note);
    return item ? Response.json({ data: item }) : Response.json({ error: { code: "MILESTONE_NOT_ACTIONABLE", message: "This milestone is not awaiting your approval." } }, { status: 409 });
  } catch { return Response.json({ error: { code: "MILESTONE_NOT_UPDATED", message: "The approval could not be saved." } }, { status: 503 }); }
}
