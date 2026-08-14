import { getPublishedPage } from "@/modules/cms/public-repository";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const page = await getPublishedPage(decodeURIComponent(slug));

  if (!page) {
    return Response.json(
      { error: { code: "PAGE_NOT_FOUND", message: "This published page was not found." } },
      { status: 404 },
    );
  }

  return Response.json({ data: page });
}
