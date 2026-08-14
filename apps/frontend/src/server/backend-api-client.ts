import { headers } from "next/headers";
import type { AdminDashboardSummary, StaffAccess } from "@divine-stone/shared/admin";
import {
  catalogItems,
  getCatalogItem,
  getRelatedCatalogItems,
  type CatalogItem,
} from "@divine-stone/shared/catalog";
import type {
  PublishedPage,
  PublishedPageSummary,
  PublicBusinessSettings,
} from "@divine-stone/shared/content";

type CatalogFacets = {
  categories: string[];
  deities: string[];
};

type ProductGalleryImage = {
  src: string;
  alt: string;
};

type ProductDetail = {
  product: CatalogItem;
  gallery: ProductGalleryImage[];
  related: CatalogItem[];
};

type BackendRequestOptions = {
  forwardAuthentication?: boolean;
  allowNotFound?: boolean;
};

class BackendRequestError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

function backendBaseUrl() {
  return (process.env.BACKEND_API_URL || "http://127.0.0.1:3001").replace(/\/$/, "");
}

async function requestBackend<T>(
  pathname: string,
  options: BackendRequestOptions = {},
): Promise<T | null> {
  const requestHeaders = new Headers({ accept: "application/json" });

  if (options.forwardAuthentication) {
    const incomingHeaders = await headers();
    const cookie = incomingHeaders.get("cookie");
    const authorization = incomingHeaders.get("authorization");
    if (cookie) requestHeaders.set("cookie", cookie);
    if (authorization) requestHeaders.set("authorization", authorization);
  }

  const response = await fetch(`${backendBaseUrl()}${pathname}`, {
    cache: "no-store",
    headers: requestHeaders,
  });

  if (options.allowNotFound && response.status === 404) return null;
  if (!response.ok) {
    throw new BackendRequestError(response.status, `Backend request failed: ${pathname}`);
  }

  return response.json() as Promise<T>;
}

export async function getPublishedPage(slug: string): Promise<PublishedPage | null> {
  try {
    const payload = await requestBackend<{ data: PublishedPage }>(
      `/api/v1/content/pages/${encodeURIComponent(slug)}`,
      { allowNotFound: true },
    );
    return payload?.data ?? null;
  } catch {
    return null;
  }
}

export async function listPublishedPages(): Promise<PublishedPageSummary[]> {
  try {
    const payload = await requestBackend<{ data: PublishedPageSummary[] }>("/api/v1/content/pages");
    return payload?.data ?? [];
  } catch {
    return [];
  }
}

export async function getPublishedBusinessSettings(): Promise<PublicBusinessSettings> {
  try {
    const payload = await requestBackend<{ data: PublicBusinessSettings }>(
      "/api/v1/content/business-settings",
    );
    return payload?.data ?? {};
  } catch {
    return {};
  }
}

export async function getPublicCatalog(): Promise<CatalogItem[]> {
  try {
    const payload = await requestBackend<{ data: CatalogItem[] }>("/api/v1/products?limit=100");
    return payload?.data ?? catalogItems;
  } catch {
    return catalogItems;
  }
}

export async function getPublicCatalogFacets(): Promise<CatalogFacets> {
  const fallback = {
    categories: [...new Set(catalogItems.map((item) => item.category))],
    deities: [...new Set(catalogItems.map((item) => item.deity))],
  };

  try {
    const payload = await requestBackend<{
      meta: CatalogFacets;
    }>("/api/v1/products?limit=1");
    return payload?.meta ?? fallback;
  } catch {
    return fallback;
  }
}

export async function getPublicCatalogItem(slug: string): Promise<CatalogItem | null> {
  return (await getProductDetail(slug))?.product ?? null;
}

export async function getProductDetail(slug: string): Promise<ProductDetail | null> {
  try {
    const payload = await requestBackend<{
      data: CatalogItem;
      gallery: ProductGalleryImage[];
      related: CatalogItem[];
    }>(`/api/v1/products/${encodeURIComponent(slug)}`, { allowNotFound: true });

    return payload
      ? { product: payload.data, gallery: payload.gallery, related: payload.related }
      : null;
  } catch {
    const product = getCatalogItem(slug);
    return product
      ? {
          product,
          gallery: [{ src: product.image, alt: product.imageAlt }],
          related: getRelatedCatalogItems(product),
        }
      : null;
  }
}

export async function getCurrentSessionStatus() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim()) {
    return { configured: false, authenticated: false };
  }

  try {
    const payload = await requestBackend<{
      data: { configured: boolean; authenticated: boolean };
    }>("/api/v1/auth/session", { forwardAuthentication: true });
    return payload?.data ?? { configured: true, authenticated: false };
  } catch (error) {
    if (error instanceof BackendRequestError && error.status === 401) {
      return { configured: true, authenticated: false };
    }
    return { configured: true, authenticated: false };
  }
}

export async function getCurrentStaffAccess(): Promise<StaffAccess> {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim()) {
    return { status: "auth-unconfigured" };
  }

  try {
    const payload = await requestBackend<{ data: { authorized: boolean } }>(
      "/api/v1/admin/access",
      { forwardAuthentication: true },
    );
    return payload?.data.authorized ? { status: "authorized" } : { status: "forbidden" };
  } catch (error) {
    if (error instanceof BackendRequestError) {
      if (error.status === 401) return { status: "signed-out" };
      if (error.status === 403) return { status: "forbidden" };
    }
    return { status: "storage-unavailable" };
  }
}

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  const payload = await requestBackend<{ data: AdminDashboardSummary }>(
    "/api/v1/admin/dashboard",
    { forwardAuthentication: true },
  );
  if (!payload) throw new Error("The admin dashboard is unavailable.");
  return payload.data;
}

export async function getDraftPagePreview<T>(id: string): Promise<T | null> {
  const payload = await requestBackend<{ data: T }>(
    `/api/v1/admin/pages/${encodeURIComponent(id)}/preview`,
    { forwardAuthentication: true, allowNotFound: true },
  );
  return payload?.data ?? null;
}
