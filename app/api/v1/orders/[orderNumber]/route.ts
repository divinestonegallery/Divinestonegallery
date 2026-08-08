import { requiredString } from "@/catalog/input";
import { requireCheckoutCustomer, checkoutUnavailable } from "@/checkout/http";
import { getCustomerOrder } from "@/checkout/repository";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const authorization = await requireCheckoutCustomer(request);
  if (authorization instanceof Response) return authorization;
  const orderNumber = requiredString((await params).orderNumber, 80);
  if (!orderNumber) {
    return Response.json(
      { error: { code: "INVALID_ORDER", message: "A valid order number is required." } },
      { status: 400 },
    );
  }
  try {
    const order = await getCustomerOrder(authorization.userId, orderNumber);
    return order
      ? Response.json({ data: order })
      : Response.json({ error: { code: "ORDER_NOT_FOUND", message: "Order not found." } }, { status: 404 });
  } catch {
    return checkoutUnavailable();
  }
}
