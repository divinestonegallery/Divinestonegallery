import { getClerkConfiguration } from "@/modules/auth/config";
import { getGallerySessionFromRequest } from "@/modules/auth/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!getClerkConfiguration()) {
    return Response.json({ data: { authenticated: false, configured: false } });
  }

  const session = await getGallerySessionFromRequest(request);
  return Response.json(
    { data: { authenticated: Boolean(session), configured: true } },
    { status: session ? 200 : 401 },
  );
}
