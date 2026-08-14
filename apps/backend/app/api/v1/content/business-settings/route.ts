import { getPublishedBusinessSettings } from "@/modules/cms/public-repository";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ data: await getPublishedBusinessSettings() });
}
