import { and, asc, eq } from "drizzle-orm";
import {
  categories,
  deities,
  mediaAssets,
  productMedia,
  products,
  productVariants,
} from "@divine-stone/database/schema";
import { CatalogItem, catalogItems } from "@divine-stone/shared/catalog";

export type PublicCatalogFacets = {
  categories: string[];
  deities: string[];
};

function heightInches(heightMm: number) {
  return Number((heightMm / 25.4).toFixed(1));
}

async function readDatabaseCatalog(): Promise<CatalogItem[]> {
  const { getDb } = await import("@divine-stone/database");
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
      weightMinGrams: productVariants.weightMinGrams,
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
      weightMinGrams: row.weightMinGrams,
      weightGrams: row.weightGrams,
    } satisfies CatalogItem];
  });
}

export async function getPublicCatalog(): Promise<CatalogItem[]> {
  if (!process.env.DATABASE_URL?.trim()) return catalogItems;
  try {
    return await readDatabaseCatalog();
  } catch {
    return catalogItems;
  }
}

export async function getPublicCatalogFacets(): Promise<PublicCatalogFacets> {
  const fallback = {
    categories: [...new Set(catalogItems.map((item) => item.category))],
    deities: [...new Set(catalogItems.map((item) => item.deity))],
  };
  if (!process.env.DATABASE_URL?.trim()) return fallback;

  try {
    const { getDb } = await import("@divine-stone/database");
    const db = getDb();
    const [categoryRows, deityRows] = await Promise.all([
      db.select({ name: categories.name }).from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.sortOrder), asc(categories.name)),
      db.select({ name: deities.name }).from(deities).where(eq(deities.isActive, true)).orderBy(asc(deities.sortOrder), asc(deities.name)),
    ]);
    return {
      categories: categoryRows.map((item) => item.name),
      deities: deityRows.map((item) => item.name),
    };
  } catch {
    return fallback;
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

export async function getProductGallery(productId: string, fallbackImage: string, fallbackAlt: string) {
  if (!process.env.DATABASE_URL?.trim()) {
    return [{ src: fallbackImage, alt: fallbackAlt }];
  }
  try {
    const { getDb } = await import("@divine-stone/database");
    const db = getDb();
    const rows = await db
      .select({
        publicPath: mediaAssets.publicPath,
        altText: mediaAssets.altText,
        mediaId: mediaAssets.id,
      })
      .from(productMedia)
      .innerJoin(mediaAssets, eq(productMedia.mediaAssetId, mediaAssets.id))
      .where(eq(productMedia.productId, productId))
      .orderBy(asc(productMedia.sortOrder));

    if (!rows.length) return [{ src: fallbackImage, alt: fallbackAlt }];

    return rows.map((row) => ({
      src: row.publicPath ?? `/api/v1/media/${encodeURIComponent(row.mediaId)}`,
      alt: row.altText ?? fallbackAlt,
    }));
  } catch {
    return [{ src: fallbackImage, alt: fallbackAlt }];
  }
}
