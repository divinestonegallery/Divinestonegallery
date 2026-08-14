import { readCustomerCollections } from "@/modules/collections/repository";
import { collectionUnavailable, requireCustomer } from "@/modules/collections/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorization = await requireCustomer(request);
  if (authorization instanceof Response) return authorization;

  try {
    return Response.json({ data: await readCustomerCollections(authorization.clerkUserId) });
  } catch {
    return collectionUnavailable();
  }
}
