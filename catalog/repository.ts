import { and, asc, eq } from "drizzle-orm";
import {
  categories,
  deities,
  mediaAssets,
  productMedia,
  products,
  productVariants,
} from "@/db/schema";
import { CatalogItem, catalogItems } from "@/features/catalog/catalog-data";

function heightInches(heightMm: number) {
  return Number((heightMm / 25.4).toFixed(1));
}

async function readDatabaseCatalog(): Promise<CatalogItem[]> {
  const { getDb } = await import("@/db");
  const db = getDb();
  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      description: products.description,
      category: categories.name,
      deity: deities.name,
      featured: products.sortOrder,
      salesMode: products.salesMode,
      variantId: productVariants.id,
      sku: productVariants.sku,
      material: productVariants.material,
      finish: productVariants.finish,
      heightMm: productVariants.heightMm,
      weightGrams: productVariants.weightGrams,
      pricePaise: productVariants.pricePaise,
      gstRateBps: productVariants.gstRateBps,
      inventoryKind: productVariants.inventoryKind,
      stockQuantity: productVariants.stockQuantity,
      image: mediaAssets.publicPath,
      mediaId: mediaAssets.id,
      imageAlt: mediaAssets.altText,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(deities, eq(products.deityId, deities.id))
    .leftJoin(
      productVariants,
      and(eq(productVariants.productId, products.id), eq(productVariants.isActive, true)),
    )
    .leftJoin(
      productMedia,
      and(eq(productMedia.productId, products.id), eq(productMedia.isPrimary, true)),
    )
    .leftJoin(mediaAssets, eq(productMedia.mediaAssetId, mediaAssets.id))
    .where(eq(products.status, "active"))
    .orderBy(asc(products.sortOrder), asc(productVariants.createdAt));

  const seen = new Set<string>();
  return rows.flatMap((row) => {
    if (
      seen.has(row.id) ||
      !row.category ||
      !row.deity ||
      !row.variantId ||
      !row.sku ||
      !row.material ||
      !row.heightMm ||
      (!row.image && !row.mediaId)
    ) {
      return [];
    }

    seen.add(row.id);
    return [{
      id: row.id,
      slug: row.slug,
      name: row.name,
      deity: row.deity,
      category: row.category,
      height: heightInches(row.heightMm),
      material: row.material,
      finish: row.finish ?? "Natural finish",
      image: row.image ?? `/api/v1/media/${encodeURIComponent(row.mediaId!)}`,
      imageAlt: row.imageAlt ?? `${row.name} hand-carved marble work`,
      featured: row.featured,
      description: row.description,
      variantId: row.variantId,
      sku: row.sku,
      pricePaise: row.pricePaise,
      gstRateBps: row.gstRateBps,
      stockQuantity: row.stockQuantity ?? undefined,
      inventoryKind: row.inventoryKind ?? undefined,
      salesMode: row.salesMode,
      weightGrams: row.weightGrams,
    } satisfies CatalogItem];
  });
}

export async function getPublicCatalog(): Promise<CatalogItem[]> {
  try {
    const items = await readDatabaseCatalog();
    return items.length ? items : catalogItems;
  } catch {
    return catalogItems;
  }
}

export async function getPublicCatalogItem(slug: string) {
  const items = await getPublicCatalog();
  return items.find((item) => item.slug === slug);
}

export async function getRelatedPublicCatalogItems(item: CatalogItem, count = 3) {
  const items = await getPublicCatalog();
  return items
    .filter((candidate) => candidate.id !== item.id)
    .sort((a, b) => {
      const aMatch = Number(a.category === item.category || a.deity === item.deity);
      const bMatch = Number(b.category === item.category || b.deity === item.deity);
      return bMatch - aMatch || a.featured - b.featured;
    })
    .slice(0, count);
}
