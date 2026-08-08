import { getClerkConfiguration } from "@/auth/config";
import { synchronizeCurrentClerkUser } from "@/auth/current-user";
import { getGallerySessionFromRequest } from "@/auth/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!getClerkConfiguration()) {
    return Response.json(
      { error: { code: "AUTH_NOT_CONFIGURED", message: "Secure accounts are not configured." } },
      { status: 503 },
    );
  }

  const session = await getGallerySessionFromRequest(request);
  if (!session) {
    return Response.json(
      { error: { code: "AUTH_REQUIRED", message: "Please sign in to continue." } },
      { status: 401 },
    );
  }

  try {
    const userId = await synchronizeCurrentClerkUser(session.userId);
    return Response.json({ data: { userId, synchronized: true } });
  } catch {
    return Response.json(
      { error: { code: "ACCOUNT_SYNC_FAILED", message: "Your account could not be prepared yet." } },
      { status: 503 },
    );
  }
}
