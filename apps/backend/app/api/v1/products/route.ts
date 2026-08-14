import { getPublicCatalog, getPublicCatalogFacets } from "@/modules/catalog/repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const search = new URL(request.url).searchParams;
  const query = search.get("q")?.trim().toLowerCase() ?? "";
  const category = search.get("category")?.trim().toLowerCase();
  const deity = search.get("deity")?.trim().toLowerCase();
  const salesMode = search.get("salesMode")?.trim();
  const limit = Math.min(Math.max(Number(search.get("limit")) || 50, 1), 100);
  const offset = Math.max(Number(search.get("offset")) || 0, 0);

  const [catalog, facets] = await Promise.all([getPublicCatalog(), getPublicCatalogFacets()]);
  const filtered = catalog.filter((item) => {
    const haystack = [item.name, item.deity, item.category, item.material, item.finish]
      .join(" ")
      .toLowerCase();
    return (
      (!query || haystack.includes(query)) &&
      (!category || item.category.toLowerCase() === category) &&
      (!deity || item.deity.toLowerCase() === deity) &&
      (!salesMode || item.salesMode === salesMode)
    );
  });

  return Response.json({
    data: filtered.slice(offset, offset + limit),
    meta: { total: filtered.length, limit, offset, ...facets },
  });
}
