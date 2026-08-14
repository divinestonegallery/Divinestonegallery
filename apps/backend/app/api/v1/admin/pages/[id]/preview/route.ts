import { authorizeStaff } from "@/modules/auth/authorization";
import { pagePreviewData } from "@/modules/cms/admin-repository";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authorization = await authorizeStaff(request);
  if (!authorization.authorized) {
    return Response.json(
      { error: { code: "STAFF_REQUIRED", message: "Staff access is required." } },
      { status: authorization.status },
    );
  }

  const { id } = await params;
  const page = await pagePreviewData(decodeURIComponent(id));
  if (!page) {
    return Response.json(
      { error: { code: "PAGE_NOT_FOUND", message: "This page preview was not found." } },
      { status: 404 },
    );
  }

  return Response.json({ data: page });
}
