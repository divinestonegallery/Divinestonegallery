import { eq, sql } from "drizzle-orm";
import { authorizeCustomer } from "@/modules/auth/authorization";
import { synchronizeCurrentClerkUser } from "@/modules/auth/current-user";
import { readJsonObject } from "@/modules/catalog/input";
import { auditLogs, communicationConsentEvents, users } from "@divine-stone/database/schema";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorization = await authorizeCustomer(request);
  if (!authorization.authorized) {
    return Response.json(
      { error: { code: "AUTH_REQUIRED", message: "Please sign in to continue." } },
      { status: authorization.status },
    );
  }

  try {
    const { getDb } = await import("@divine-stone/database");
    const db = getDb();
    let [customer] = await db
      .select({
        id: users.id,
        displayName: users.displayName,
        email: users.email,
        phoneE164: users.phoneE164,
        emailVerifiedAt: users.emailVerifiedAt,
        phoneVerifiedAt: users.phoneVerifiedAt,
        whatsappTransactionalOptInAt: users.whatsappTransactionalOptInAt,
        status: users.status,
      })
      .from(users)
      .where(eq(users.id, authorization.userId))
      .limit(1);

    if (!customer) {
      await synchronizeCurrentClerkUser(authorization.clerkUserId);
      [customer] = await db
        .select({
          id: users.id,
          displayName: users.displayName,
          email: users.email,
          phoneE164: users.phoneE164,
          emailVerifiedAt: users.emailVerifiedAt,
          phoneVerifiedAt: users.phoneVerifiedAt,
          whatsappTransactionalOptInAt: users.whatsappTransactionalOptInAt,
          status: users.status,
        })
        .from(users)
        .where(eq(users.id, authorization.userId))
        .limit(1);
    }

    if (!customer || customer.status !== "active") {
      return Response.json(
        { error: { code: "ACCOUNT_UNAVAILABLE", message: "This account is unavailable." } },
        { status: 403 },
      );
    }

    return Response.json({
      data: {
        ...customer,
        emailVerified: Boolean(customer.emailVerifiedAt),
        phoneVerified: Boolean(customer.phoneVerifiedAt),
        whatsappTransactionalUpdates: Boolean(customer.whatsappTransactionalOptInAt),
      },
    });
  } catch {
    return Response.json(
      { error: { code: "ACCOUNT_UNAVAILABLE", message: "Your account could not be loaded." } },
      { status: 503 },
    );
  }
}

export async function PATCH(request: Request) {
  const authorization = await authorizeCustomer(request);
  if (!authorization.authorized) {
    return Response.json(
      { error: { code: "AUTH_REQUIRED", message: "Please sign in to continue." } },
      { status: authorization.status },
    );
  }
  const body = await readJsonObject(request);
  if (!body || typeof body.whatsappTransactionalUpdates !== "boolean") {
    return Response.json(
      { error: { code: "INVALID_PREFERENCE", message: "Choose whether to receive transactional WhatsApp updates." } },
      { status: 400 },
    );
  }
  try {
    await synchronizeCurrentClerkUser(authorization.clerkUserId);
    const { getDb } = await import("@divine-stone/database");
    const db = getDb();
    const [customer] = await db.select({
      phoneVerifiedAt: users.phoneVerifiedAt,
      whatsappTransactionalOptInAt: users.whatsappTransactionalOptInAt,
      status: users.status,
    }).from(users).where(eq(users.id, authorization.userId)).limit(1);
    if (!customer || customer.status !== "active") {
      return Response.json({ error: { code: "ACCOUNT_UNAVAILABLE", message: "This account is unavailable." } }, { status: 403 });
    }
    if (body.whatsappTransactionalUpdates && !customer.phoneVerifiedAt) {
      return Response.json(
        { error: { code: "VERIFIED_PHONE_REQUIRED", message: "Verify your phone number before enabling WhatsApp updates." } },
        { status: 409 },
      );
    }
    const enabled = Boolean(customer.whatsappTransactionalOptInAt);
    if (enabled === body.whatsappTransactionalUpdates) {
      return Response.json({ data: { whatsappTransactionalUpdates: enabled } });
    }
    const now = Math.floor(Date.now() / 1000);
    const action = body.whatsappTransactionalUpdates ? "granted" as const : "withdrawn" as const;
    await db.batch([
      db.update(users).set({ whatsappTransactionalOptInAt: action === "granted" ? now : null, updatedAt: sql`(extract(epoch from now())::integer)` }).where(eq(users.id, authorization.userId)),
      db.insert(communicationConsentEvents).values({
        id: `consent:${crypto.randomUUID()}`,
        userId: authorization.userId,
        channel: "whatsapp",
        purpose: "transactional_updates",
        action,
        policyVersion: "privacy-2026-08-09",
        source: "account",
      }),
      db.insert(auditLogs).values({
        id: crypto.randomUUID(),
        actorUserId: authorization.userId,
        action: `communication.whatsapp.${action}`,
        entityType: "user",
        entityId: authorization.userId,
        changesJson: JSON.stringify({ purpose: "transactional_updates", policyVersion: "privacy-2026-08-09" }),
      }),
    ]);
    return Response.json({ data: { whatsappTransactionalUpdates: action === "granted" } });
  } catch {
    return Response.json(
      { error: { code: "PREFERENCE_NOT_SAVED", message: "Your communication preference could not be saved." } },
      { status: 503 },
    );
  }
}
