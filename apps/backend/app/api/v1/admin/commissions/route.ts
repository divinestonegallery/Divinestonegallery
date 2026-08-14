import { authorizeStaff } from "@/modules/auth/authorization";
import { listAdminCommissions } from "@/modules/commissions/repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorization = await authorizeStaff(request);
  if (!authorization.authorized) return Response.json({ error: { code: "STAFF_REQUIRED", message: "Staff access is required." } }, { status: authorization.status });
  try { return Response.json({ data: await listAdminCommissions() }); }
  catch { return Response.json({ error: { code: "COMMISSIONS_UNAVAILABLE", message: "The commission queue could not be loaded." } }, { status: 503 }); }
}
