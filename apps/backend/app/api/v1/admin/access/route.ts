import { authorizeStaff } from "@/modules/auth/authorization";
import { synchronizeCurrentClerkUser } from "@/modules/auth/current-user";
import { getGallerySessionFromRequest } from "@/modules/auth/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getGallerySessionFromRequest(request);
  if (!session) return Response.json({ data: { authorized: false } }, { status: 401 });

  try {
    await synchronizeCurrentClerkUser(session.userId);
    const authorization = await authorizeStaff(request);
    return Response.json({ data: { authorized: authorization.authorized } }, {
      status: authorization.authorized ? 200 : authorization.status,
    });
  } catch {
    return Response.json(
      { error: { code: "ADMIN_ACCESS_UNAVAILABLE", message: "Admin access could not be checked." } },
      { status: 503 },
    );
  }
}
