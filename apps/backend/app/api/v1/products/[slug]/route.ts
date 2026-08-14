import {
  getProductGallery,
  getPublicCatalogItem,
  getRelatedPublicCatalogItems,
} from "@/modules/catalog/repository";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const product = await getPublicCatalogItem(slug);

  if (!product) {
    return Response.json(
      { error: { code: "PRODUCT_NOT_FOUND", message: "This product was not found." } },
      { status: 404 },
    );
  }

  const [gallery, related] = await Promise.all([
    getProductGallery(product.id, product.image, product.imageAlt),
    getRelatedPublicCatalogItems(product),
  ]);

  return Response.json({ data: product, gallery, related });
}
