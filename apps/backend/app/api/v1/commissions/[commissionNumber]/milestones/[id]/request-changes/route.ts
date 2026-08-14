import { readJsonObject } from "@/modules/catalog/input";
import { requireCheckoutCustomer } from "@/modules/checkout/http";
import { parseMilestoneDecision } from "@/modules/commissions/input";
import { decideMilestone } from "@/modules/commissions/repository";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ commissionNumber: string; id: string }> }) {
  const authorization = await requireCheckoutCustomer(request);
  if (authorization instanceof Response) return authorization;
  const { commissionNumber, id } = await params;
  const body = await readJsonObject(request) ?? {};
  const note = parseMilestoneDecision(body).note;
  if (!note) return Response.json({ error: { code: "CHANGE_NOTE_REQUIRED", message: "Please explain the changes you need." } }, { status: 400 });
  try {
    const item = await decideMilestone(authorization.userId, commissionNumber, id, "changes_requested", note);
    return item ? Response.json({ data: item }) : Response.json({ error: { code: "MILESTONE_NOT_ACTIONABLE", message: "This milestone is not awaiting your review." } }, { status: 409 });
  } catch { return Response.json({ error: { code: "MILESTONE_NOT_UPDATED", message: "The change request could not be saved." } }, { status: 503 }); }
}
