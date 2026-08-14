import { getNotificationWorkerSecret } from "@/modules/messaging/config";
import { processNotificationQueue } from "@/modules/messaging/service";

export const dynamic = "force-dynamic";

function constantTimeEqual(left: string, right: string) {
  let difference = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) difference |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  return difference === 0;
}

export async function POST(request: Request) {
  const configured = getNotificationWorkerSecret();
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  if (!configured) return Response.json({ error: { code: "WORKER_NOT_CONFIGURED", message: "Notification worker is not configured." } }, { status: 503 });
  if (!supplied || !constantTimeEqual(configured, supplied)) return Response.json({ error: { code: "WORKER_UNAUTHORIZED", message: "Notification worker authorization failed." } }, { status: 401 });
  try { return Response.json({ data: await processNotificationQueue(30) }); }
  catch { return Response.json({ error: { code: "NOTIFICATION_RUN_FAILED", message: "The notification queue could not be processed." } }, { status: 503 }); }
}

export const GET = POST;
