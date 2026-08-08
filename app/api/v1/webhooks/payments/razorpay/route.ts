import { getRazorpayWebhookSecret } from "@/payments/config";
import { sha256Hex, verifyRazorpayWebhookSignature } from "@/payments/providers/razorpay";
import { processRazorpayWebhook } from "@/payments/service";
import { readTextWithinLimit } from "@/security/request-limits";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = getRazorpayWebhookSecret();
  if (!secret) {
    return Response.json(
      { error: { code: "WEBHOOK_NOT_CONFIGURED", message: "Razorpay webhook is not configured." } },
      { status: 503 },
    );
  }
  const rawBody = await readTextWithinLimit(request, 1024 * 1024);
  if (rawBody === null) {
    return Response.json(
      { error: { code: "WEBHOOK_TOO_LARGE", message: "Webhook payload is too large." } },
      { status: 413 },
    );
  }
  const signature = request.headers.get("x-razorpay-signature") || "";
  if (!signature || !(await verifyRazorpayWebhookSignature(rawBody, signature, secret))) {
    return Response.json(
      { error: { code: "INVALID_WEBHOOK", message: "Webhook signature is invalid." } },
      { status: 400 },
    );
  }
  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return Response.json(
      { error: { code: "INVALID_WEBHOOK_PAYLOAD", message: "Webhook payload is invalid." } },
      { status: 400 },
    );
  }
  const payloadSha256 = await sha256Hex(rawBody);
  const eventId = request.headers.get("x-razorpay-event-id")?.trim() || `sha256:${payloadSha256}`;
  try {
    const result = await processRazorpayWebhook(payload, eventId, payloadSha256);
    return Response.json({ received: true, ...result });
  } catch {
    return Response.json(
      { error: { code: "WEBHOOK_PROCESSING_FAILED", message: "Webhook will be retried." } },
      { status: 500 },
    );
  }
}
