import { authorizeStaff } from "@/auth/authorization";
import { notificationQueueStatus, processNotificationQueue } from "@/messaging/service";

export const dynamic = "force-dynamic";

async function staff(request: Request) {
  const authorization = await authorizeStaff(request);
  return authorization.authorized ? authorization : Response.json({ error: { code: "STAFF_REQUIRED", message: "Staff access is required." } }, { status: authorization.status });
}

export async function GET(request: Request) {
  const authorization = await staff(request);
  if (authorization instanceof Response) return authorization;
  try { return Response.json({ data: await notificationQueueStatus() }); }
  catch { return Response.json({ error: { code: "NOTIFICATIONS_UNAVAILABLE", message: "Notification status could not be loaded." } }, { status: 503 }); }
}

export async function POST(request: Request) {
  const authorization = await staff(request);
  if (authorization instanceof Response) return authorization;
  try { return Response.json({ data: await processNotificationQueue(20), status: await notificationQueueStatus() }); }
  catch { return Response.json({ error: { code: "NOTIFICATION_RUN_FAILED", message: "The notification queue could not be processed." } }, { status: 503 }); }
}
