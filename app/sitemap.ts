import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/site";
import { catalogItems } from "@/features/catalog/catalog-data";
import { guides } from "@/features/guides/guide-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const staticRoutes = ["", "/shop", "/custom-murti", "/our-story", "/artisans", "/guides", "/contact", "/faq", "/shipping", "/privacy", "/terms", "/returns"];

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteUrl}${route}`,
      changeFrequency: route === "" || route === "/shop" ? "weekly" as const : "monthly" as const,
      priority: route === "" ? 1 : route === "/shop" ? 0.9 : 0.7,
    })),
    ...catalogItems.map((item) => ({ url: `${siteUrl}/products/${item.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...guides.map((guide) => ({ url: `${siteUrl}/guides/${guide.slug}`, changeFrequency: "monthly" as const, priority: 0.65 })),
  ];
}
