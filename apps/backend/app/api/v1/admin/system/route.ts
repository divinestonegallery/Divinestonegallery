import { authorizeStaff } from "@/modules/auth/authorization";
import { readJsonObject, requiredString } from "@/modules/catalog/input";
import { listSystemAdminData, updateBusinessSetting, updateStaffAccess } from "@/modules/admin/system-repository";

export const dynamic = "force-dynamic";

async function authorize(request: Request) {
  const result = await authorizeStaff(request);
  return result.authorized ? result : Response.json({ error: { code: "STAFF_REQUIRED", message: "Full staff access is required." } }, { status: result.status });
}

export async function GET(request: Request) {
  const authorization = await authorize(request); if (authorization instanceof Response) return authorization;
  try { return Response.json({ data: await listSystemAdminData(), currentUserId: authorization.userId }); }
  catch { return Response.json({ error: { code: "SYSTEM_UNAVAILABLE", message: "Settings could not be loaded." } }, { status: 503 }); }
}

export async function PATCH(request: Request) {
  const authorization = await authorize(request); if (authorization instanceof Response) return authorization;
  const body = await readJsonObject(request); if (!body) return Response.json({ error: { code: "INVALID_JSON", message: "A valid update is required." } }, { status: 400 });
  try {
    if (body.entity === "setting") {
      const key = requiredString(body.key, 100); const value = requiredString(body.value, 2000);
      if (!key || !value) throw new Error("INVALID");
      return Response.json({ data: await updateBusinessSetting(key, value, authorization.userId) });
    }
    if (body.entity === "staff") {
      const userId = requiredString(body.userId, 180);
      const status = body.status === "active" || body.status === "disabled" ? body.status : null;
      if (!userId || !status || (userId === authorization.userId && status === "disabled")) throw new Error("INVALID");
      return Response.json({ data: await updateStaffAccess(userId, status, authorization.userId) });
    }
    throw new Error("INVALID");
  } catch { return Response.json({ error: { code: "SYSTEM_UPDATE_FAILED", message: "The update was rejected. You cannot disable your own account." } }, { status: 409 }); }
}
