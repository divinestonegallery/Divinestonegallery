import { requireCheckoutCustomer, checkoutUnavailable } from "@/checkout/http";
import { readCheckoutPreview } from "@/checkout/repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorization = await requireCheckoutCustomer(request);
  if (authorization instanceof Response) return authorization;

  try {
    return Response.json({
      data: await readCheckoutPreview(
        authorization.clerkUserId,
        authorization.userId,
      ),
    });
  } catch {
    return checkoutUnavailable();
  }
}
