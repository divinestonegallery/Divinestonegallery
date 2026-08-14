import { requireCheckoutCustomer } from "@/modules/checkout/http";
import { attachCommissionReference } from "@/modules/commissions/repository";
import { storeCommissionImage } from "@/modules/commissions/upload";
import { declaredBodyExceeds } from "@/modules/security/request-limits";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ commissionNumber: string }> }) {
  const authorization = await requireCheckoutCustomer(request);
  if (authorization instanceof Response) return authorization;
  if (declaredBodyExceeds(request, 4_200_000)) return Response.json({ error: { code: "UPLOAD_TOO_LARGE", message: "Image upload is too large." } }, { status: 413 });
  const { commissionNumber } = await params;
  let form: FormData;
  try { form = await request.formData(); } catch { return Response.json({ error: { code: "INVALID_UPLOAD", message: "Choose a valid image." } }, { status: 400 }); }
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: { code: "IMAGE_REQUIRED", message: "Choose a JPEG, PNG or WebP image." } }, { status: 400 });
  const stored = await storeCommissionImage(file, commissionNumber, "Customer reference for a custom moorti");
  if (!stored) return Response.json({ error: { code: "INVALID_IMAGE", message: "Use a genuine optimized JPEG, PNG or WebP image up to 4 MB." } }, { status: 400 });
  try {
    const id = await attachCommissionReference(authorization.userId, commissionNumber, stored.asset);
    if (!id) { await stored.remove(); return Response.json({ error: { code: "COMMISSION_NOT_FOUND", message: "Commission not found." } }, { status: 404 }); }
    return Response.json({ data: { id } }, { status: 201 });
  } catch {
    await stored.remove();
    return Response.json({ error: { code: "MEDIA_SAVE_FAILED", message: "The reference image could not be attached." } }, { status: 503 });
  }
}
