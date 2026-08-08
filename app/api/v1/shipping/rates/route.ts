import { handleShippingRateRequest } from "@/shipping/rate-handler";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handleShippingRateRequest(request);
}
