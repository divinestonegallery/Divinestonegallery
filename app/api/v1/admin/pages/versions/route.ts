import { authorizeStaff } from "@/auth/authorization";
import { readJsonObject, requiredString } from "@/catalog/input";
import { listPageVersions, restorePageVersion } from "@/cms/admin-repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorization = await authorizeStaff(request); if (!authorization.authorized) return Response.json({ error: { code: "STAFF_REQUIRED", message: "Staff access is required." } }, { status: authorization.status });
  const pageId = new URL(request.url).searchParams.get("pageId"); if (!pageId) return Response.json({ error: { code: "PAGE_REQUIRED", message: "Choose a page." } }, { status: 400 });
  return Response.json({ data: await listPageVersions(pageId) });
}

export async function POST(request: Request) {
  const authorization = await authorizeStaff(request); if (!authorization.authorized) return Response.json({ error: { code: "STAFF_REQUIRED", message: "Staff access is required." } }, { status: authorization.status });
  const body = await readJsonObject(request); const versionId = body ? requiredString(body.versionId, 180) : null;
  if (!versionId) return Response.json({ error: { code: "VERSION_REQUIRED", message: "Choose a saved version." } }, { status: 400 });
  try { return Response.json({ data: await restorePageVersion(versionId, authorization.userId) }); }
  catch { return Response.json({ error: { code: "RESTORE_FAILED", message: "This version could not be restored." } }, { status: 409 }); }
}
