import { readJsonObject } from "@/modules/catalog/input";
import { requireCheckoutCustomer } from "@/modules/checkout/http";
import { parseRazorpayVerification } from "@/modules/payments/input";
import { verifyCustomerRazorpayPayment } from "@/modules/payments/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const authorization = await requireCheckoutCustomer(request);
  if (authorization instanceof Response) return authorization;
  const body = await readJsonObject(request);
  const input = body ? parseRazorpayVerification(body) : null;
  if (!input) {
    return Response.json(
      { error: { code: "INVALID_PAYMENT_CONFIRMATION", message: "The payment confirmation is incomplete." } },
      { status: 400 },
    );
  }
  try {
    const result = await verifyCustomerRazorpayPayment(authorization.userId, input);
    if ("notConfigured" in result) return Response.json({ error: { code: "ONLINE_PROVIDER_REQUIRED", message: "Online payment is not configured." } }, { status: 503 });
    if ("notFound" in result) return Response.json({ error: { code: "PAYMENT_NOT_FOUND", message: "This payment does not belong to your order." } }, { status: 404 });
    if ("invalidSignature" in result) return Response.json({ error: { code: "INVALID_PAYMENT_SIGNATURE", message: "Payment verification failed." } }, { status: 400 });
    if ("mismatch" in result) return Response.json({ error: { code: "PAYMENT_MISMATCH", message: "The paid amount or order reference does not match." } }, { status: 409 });
    return Response.json({ data: result.order });
  } catch {
    return Response.json(
      { error: { code: "PAYMENT_NOT_CONFIRMED", message: "We could not confirm the payment yet. Your order remains safely recorded." } },
      { status: 409 },
    );
  }
}
