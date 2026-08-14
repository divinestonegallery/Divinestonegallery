import { authorizeStaff } from "@/modules/auth/authorization";
import { getAdminDashboardSummary } from "@/modules/admin/dashboard-repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorization = await authorizeStaff(request);
  if (!authorization.authorized) {
    return Response.json(
      { error: { code: "STAFF_REQUIRED", message: "Staff access is required." } },
      { status: authorization.status },
    );
  }

  try {
    return Response.json({ data: await getAdminDashboardSummary() });
  } catch {
    return Response.json(
      { error: { code: "DASHBOARD_UNAVAILABLE", message: "The admin dashboard could not be loaded." } },
      { status: 503 },
    );
  }
}
