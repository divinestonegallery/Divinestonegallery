import { verifyWebhook } from "@clerk/backend/webhooks";
import { sql } from "drizzle-orm";
import {
  markClerkIdentityDeleted,
  profileFromWebhookUser,
  syncClerkIdentity,
} from "@/modules/auth/clerk-sync";
import { getDb } from "@divine-stone/database";
import { webhookEvents } from "@divine-stone/database/schema";
import { readBytesWithinLimit } from "@/modules/security/request-limits";

export const dynamic = "force-dynamic";

async function sha256(value: ArrayBuffer) {
  const digest = await crypto.subtle.digest("SHA-256", value);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET?.trim();
  if (!signingSecret) {
    return Response.json(
      { error: { code: "WEBHOOK_NOT_CONFIGURED", message: "Webhook is not configured." } },
      { status: 503 },
    );
  }

  const body = await readBytesWithinLimit(request.clone(), 1024 * 1024);
  if (!body) {
    return Response.json(
      { error: { code: "WEBHOOK_TOO_LARGE", message: "Webhook payload is too large." } },
      { status: 413 },
    );
  }
  let event: Awaited<ReturnType<typeof verifyWebhook>>;

  try {
    event = await verifyWebhook(request, { signingSecret });
  } catch {
    return Response.json(
      { error: { code: "INVALID_WEBHOOK", message: "Webhook signature is invalid." } },
      { status: 400 },
    );
  }

  try {
    if (event.type === "user.created" || event.type === "user.updated") {
      await syncClerkIdentity(profileFromWebhookUser(event.data));
    } else if (event.type === "user.deleted" && event.data.id) {
      await markClerkIdentityDeleted(event.data.id);
    }

    const eventId =
      request.headers.get("webhook-id") ??
      request.headers.get("svix-id") ??
      `${event.type}:${event.data.id ?? crypto.randomUUID()}`;
    const db = getDb();
    await db
      .insert(webhookEvents)
      .values({
        id: `clerk:${eventId}`,
        provider: "clerk",
        providerEventId: eventId,
        eventType: event.type,
        payloadSha256: await sha256(body),
        status: "processed",
        attempts: 1,
        processedAt: sql`(extract(epoch from now())::integer)`,
      })
      .onConflictDoNothing({
        target: [webhookEvents.provider, webhookEvents.providerEventId],
      });

    return Response.json({ received: true });
  } catch {
    return Response.json(
      { error: { code: "WEBHOOK_PROCESSING_FAILED", message: "Webhook will be retried." } },
      { status: 500 },
    );
  }
}
