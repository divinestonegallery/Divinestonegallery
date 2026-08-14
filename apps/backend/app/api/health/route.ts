export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    data: {
      service: "divine-stone-backend",
      status: "healthy",
    },
  });
}
