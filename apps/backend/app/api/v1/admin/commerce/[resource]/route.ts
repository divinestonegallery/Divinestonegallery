import { authorizeStaff } from "@/modules/auth/authorization";
import { enumValue, optionalInteger, readJsonObject, requiredString } from "@/modules/catalog/input";
import {
  createAdminReturn,
  CustomerPatch,
  listAdminCustomers,
  listAdminOrders,
  listAdminPayments,
  listAdminReturns,
  listAdminShipments,
  OrderPatch,
  PaymentPatch,
  ReturnPatch,
  ShipmentPatch,
  updateAdminCustomer,
  updateAdminOrder,
  updateAdminPayment,
  updateAdminReturn,
  updateAdminShipment,
} from "@/modules/commerce/admin-repository";

export const dynamic = "force-dynamic";

type Resource = "orders" | "customers" | "payments" | "shipping" | "returns";

function resource(value: string): Resource | null {
  return enumValue(value, ["orders", "customers", "payments", "shipping", "returns"] as const);
}

function nullableString(value: unknown, max: number): string | null | undefined {
  if (value === null || value === "") return null;
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized && normalized.length <= max ? normalized : undefined;
}

async function authorize(request: Request) {
  const result = await authorizeStaff(request);
  if (result.authorized) return result;
  return Response.json({ error: { code: "STAFF_REQUIRED", message: "Staff access is required." } }, { status: result.status });
}

export async function GET(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  const authorization = await authorize(request);
  if (authorization instanceof Response) return authorization;
  const target = resource((await params).resource);
  if (!target) return Response.json({ error: { code: "UNKNOWN_RESOURCE", message: "Commerce resource not found." } }, { status: 404 });
  try {
    const data = target === "orders" ? await listAdminOrders()
      : target === "customers" ? await listAdminCustomers()
        : target === "payments" ? await listAdminPayments()
          : target === "shipping" ? await listAdminShipments()
            : await listAdminReturns();
    return Response.json({ data });
  } catch {
    return Response.json({ error: { code: "COMMERCE_UNAVAILABLE", message: "Commerce records could not be loaded." } }, { status: 503 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  const authorization = await authorize(request);
  if (authorization instanceof Response) return authorization;
  const target = resource((await params).resource);
  const body = await readJsonObject(request);
  if (!target || !body) return Response.json({ error: { code: "INVALID_UPDATE", message: "A valid commerce update is required." } }, { status: 400 });
  const id = requiredString(body.id, 140);
  if (!id) return Response.json({ error: { code: "INVALID_ID", message: "A valid record is required." } }, { status: 400 });

  try {
    if (target === "orders") {
      const patch: OrderPatch = {};
      if ("status" in body) { const value = enumValue(body.status, ["approval_pending", "placed", "confirmed", "in_production", "ready_to_ship", "shipped", "delivered", "cancelled", "returned"] as const); if (!value) throw new Error("INVALID"); patch.status = value; }
      if ("paymentStatus" in body) { const value = enumValue(body.paymentStatus, ["pending", "partially_paid", "paid", "failed", "refunded", "partially_refunded"] as const); if (!value) throw new Error("INVALID"); patch.paymentStatus = value; }
      if ("codApprovalStatus" in body) { const value = enumValue(body.codApprovalStatus, ["not_required", "pending", "approved", "rejected"] as const); if (!value) throw new Error("INVALID"); patch.codApprovalStatus = value; }
      if (!Object.keys(patch).length) throw new Error("EMPTY");
      return Response.json({ data: await updateAdminOrder(id, patch, authorization.userId) });
    }

    if (target === "customers") {
      const patch: CustomerPatch = {};
      if ("status" in body) { const value = enumValue(body.status, ["active", "blocked", "deleted"] as const); if (!value) throw new Error("INVALID"); patch.status = value; }
      if ("preferredLocale" in body) { const value = enumValue(body.preferredLocale, ["en-IN", "hi-IN"] as const); if (!value) throw new Error("INVALID"); patch.preferredLocale = value; }
      if (!Object.keys(patch).length) throw new Error("EMPTY");
      return Response.json({ data: await updateAdminCustomer(id, patch, authorization.userId) });
    }

    if (target === "payments") {
      const patch: PaymentPatch = {};
      if ("status" in body) { const value = enumValue(body.status, ["created", "pending", "authorized", "captured", "failed", "refunded", "cancelled"] as const); if (!value) throw new Error("INVALID"); patch.status = value; }
      if ("bankReference" in body) { const value = nullableString(body.bankReference, 180); if (value === undefined) throw new Error("INVALID"); patch.bankReference = value; }
      if ("providerPaymentId" in body) { const value = nullableString(body.providerPaymentId, 180); if (value === undefined) throw new Error("INVALID"); patch.providerPaymentId = value; }
      if (!Object.keys(patch).length) throw new Error("EMPTY");
      return Response.json({ data: await updateAdminPayment(id, patch, authorization.userId) });
    }

    if (target === "shipping") {
      const patch: ShipmentPatch = {};
      if ("status" in body) { const value = enumValue(body.status, ["rate_selected", "booked", "picked_up", "in_transit", "delivered", "exception", "cancelled"] as const); if (!value) throw new Error("INVALID"); patch.status = value; }
      for (const key of ["provider", "providerShipmentId", "trackingNumber", "serviceName"] as const) {
        if (key in body) { const value = nullableString(body[key], 180); if (value === undefined) throw new Error("INVALID"); patch[key] = value; }
      }
      if ("estimatedDeliveryAt" in body) { const value = optionalInteger(body.estimatedDeliveryAt, 0); if (value === undefined) throw new Error("INVALID"); patch.estimatedDeliveryAt = value; }
      if (!Object.keys(patch).length) throw new Error("EMPTY");
      return Response.json({ data: await updateAdminShipment(id, patch, authorization.userId) });
    }

    const patch: ReturnPatch = {};
    if ("status" in body) { const value = enumValue(body.status, ["requested", "under_review", "approved", "rejected", "in_transit", "received", "refunded", "closed"] as const); if (!value) throw new Error("INVALID"); patch.status = value; }
    if ("staffDecisionNote" in body) { const value = nullableString(body.staffDecisionNote, 2000); if (value === undefined) throw new Error("INVALID"); patch.staffDecisionNote = value; }
    if (!Object.keys(patch).length) throw new Error("EMPTY");
    return Response.json({ data: await updateAdminReturn(id, patch, authorization.userId) });
  } catch {
    return Response.json({ error: { code: "COMMERCE_UPDATE_FAILED", message: "The record could not be updated. Check the supplied values." } }, { status: 409 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  const authorization = await authorize(request);
  if (authorization instanceof Response) return authorization;
  const target = resource((await params).resource);
  if (target !== "returns") return Response.json({ error: { code: "METHOD_NOT_ALLOWED", message: "Creation is not available for this resource." } }, { status: 405 });
  const body = await readJsonObject(request);
  if (!body) return Response.json({ error: { code: "INVALID_JSON", message: "Return details are required." } }, { status: 400 });
  const orderId = requiredString(body.orderId, 140);
  const reason = requiredString(body.reason, 500);
  const customerNote = nullableString(body.customerNote, 2000);
  if (!orderId || !reason || customerNote === undefined) return Response.json({ error: { code: "INVALID_RETURN", message: "Order and reason are required." } }, { status: 400 });
  try {
    return Response.json({ data: await createAdminReturn(orderId, reason, customerNote, authorization.userId) }, { status: 201 });
  } catch {
    return Response.json({ error: { code: "RETURN_CREATE_FAILED", message: "The return could not be opened for this order." } }, { status: 409 });
  }
}
