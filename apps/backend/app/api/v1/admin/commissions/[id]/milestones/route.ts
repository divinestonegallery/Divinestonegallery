import { authorizeStaff } from "@/modules/auth/authorization";
import { readJsonObject } from "@/modules/catalog/input";
import { parseMilestone } from "@/modules/commissions/input";
import { createMilestone } from "@/modules/commissions/repository";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeStaff(request);
  if (!authorization.authorized) return Response.json({ error: { code: "STAFF_REQUIRED", message: "Staff access is required." } }, { status: authorization.status });
  const body = await readJsonObject(request);
  const input = body ? parseMilestone(body) : null;
  if (!input) return Response.json({ error: { code: "INVALID_MILESTONE", message: "A milestone title is required." } }, { status: 400 });
  try {
    const item = await createMilestone((await params).id, input, authorization.userId);
    return item ? Response.json({ data: item }, { status: 201 }) : Response.json({ error: { code: "COMMISSION_NOT_FOUND", message: "Commission not found." } }, { status: 404 });
  } catch { return Response.json({ error: { code: "MILESTONE_NOT_CREATED", message: "The milestone could not be created." } }, { status: 503 }); }
}
