import { readJsonObject } from "@/catalog/input";
import { requireCheckoutCustomer, checkoutUnavailable } from "@/checkout/http";
import { parseIdempotencyKey, parsePlaceOrder } from "@/checkout/input";
import {
  checkoutRequestHash,
  listCustomerOrders,
  placeOrder,
} from "@/checkout/repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorization = await requireCheckoutCustomer(request);
  if (authorization instanceof Response) return authorization;
  try {
    return Response.json({ data: await listCustomerOrders(authorization.userId) });
  } catch {
    return checkoutUnavailable();
  }
}

export async function POST(request: Request) {
  const authorization = await requireCheckoutCustomer(request);
  if (authorization instanceof Response) return authorization;
  const idempotencyKey = parseIdempotencyKey(request.headers.get("idempotency-key"));
  if (!idempotencyKey) {
    return Response.json(
      { error: { code: "IDEMPOTENCY_KEY_REQUIRED", message: "A valid Idempotency-Key header is required." } },
      { status: 400 },
    );
  }
  const body = await readJsonObject(request);
  const input = body ? parsePlaceOrder(body) : null;
  if (!input) {
    return Response.json(
      { error: { code: "INVALID_ORDER", message: "Valid shipping, billing and payment details are required." } },
      { status: 400 },
    );
  }

  try {
    const result = await placeOrder(
      authorization.clerkUserId,
      authorization.userId,
      idempotencyKey,
      await checkoutRequestHash(input),
      input,
    );
    if ("conflict" in result) return Response.json({ error: { code: "IDEMPOTENCY_CONFLICT", message: "This submission key was already used for different order details." } }, { status: 409 });
    if ("onlineProviderRequired" in result) return Response.json({ error: { code: "ONLINE_PROVIDER_REQUIRED", message: "Online payment is not active until the payment gateway is connected." } }, { status: 503 });
    if ("issues" in result) return Response.json({ error: { code: "CHECKOUT_NOT_READY", message: "One or more products are not ready for checkout.", details: result.issues } }, { status: 409 });
    if ("shippingQuoteInvalid" in result) return Response.json({ error: { code: "SHIPPING_QUOTE_REQUIRED", message: "A current automatic shipping quote is required." } }, { status: 409 });
    if ("phoneVerificationRequired" in result) return Response.json({ error: { code: "PHONE_VERIFICATION_REQUIRED", message: "Verify your phone number before choosing Cash on Delivery." } }, { status: 409 });
    if ("codUnavailable" in result) return Response.json({ error: { code: "COD_UNAVAILABLE", message: "Cash on Delivery is unavailable for this order." } }, { status: 409 });
    return Response.json(
      {
        data: result.order,
        paymentSession: "paymentSession" in result ? result.paymentSession : null,
        meta: { replayed: result.replayed },
      },
      { status: result.replayed ? 200 : 201 },
    );
  } catch {
    return Response.json(
      { error: { code: "ORDER_NOT_CREATED", message: "The order could not be created. Stock and totals were not changed." } },
      { status: 409 },
    );
  }
}
