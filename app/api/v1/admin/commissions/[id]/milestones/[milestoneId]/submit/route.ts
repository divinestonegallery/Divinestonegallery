import { authorizeStaff } from "@/auth/authorization";
import { submitMilestone } from "@/commissions/repository";
import { storeCommissionImage } from "@/commissions/upload";
import { declaredBodyExceeds } from "@/security/request-limits";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string; milestoneId: string }> }) {
  const authorization = await authorizeStaff(request);
  if (!authorization.authorized) return Response.json({ error: { code: "STAFF_REQUIRED", message: "Staff access is required." } }, { status: authorization.status });
  if (declaredBodyExceeds(request, 4_200_000)) return Response.json({ error: { code: "UPLOAD_TOO_LARGE", message: "Milestone upload is too large." } }, { status: 413 });
  const { id, milestoneId } = await params;
  let form: FormData;
  try { form = await request.formData(); } catch { return Response.json({ error: { code: "INVALID_SUBMISSION", message: "Valid milestone details are required." } }, { status: 400 }); }
  const files = form.getAll("files").filter((item): item is File => item instanceof File && item.size > 0);
  const staffNote = typeof form.get("staffNote") === "string" ? String(form.get("staffNote")).trim().slice(0, 2000) || null : null;
  if (!files.length || files.length > 6) return Response.json({ error: { code: "MILESTONE_MEDIA_REQUIRED", message: "Add between 1 and 6 progress images." } }, { status: 400 });
  const stored = [];
  try {
    for (const file of files) {
      const image = await storeCommissionImage(file, `${id}/${milestoneId}`, "Custom moorti production milestone");
      if (!image) throw new Error("INVALID_IMAGE");
      stored.push(image);
    }
    const item = await submitMilestone(id, milestoneId, staffNote, stored.map((item) => item.asset), authorization.userId);
    if (!item) { await Promise.all(stored.map((item) => item.remove())); return Response.json({ error: { code: "MILESTONE_NOT_ACTIONABLE", message: "This milestone cannot be submitted now." } }, { status: 409 }); }
    return Response.json({ data: item });
  } catch {
    await Promise.all(stored.map((item) => item.remove()));
    return Response.json({ error: { code: "MILESTONE_NOT_SUBMITTED", message: "Use 1–6 valid optimized JPEG, PNG or WebP images." } }, { status: 503 });
  }
}
