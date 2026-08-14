import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CookieConsent } from "@/components/site/cookie-consent";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { WhatsAppAssistance } from "@/components/site/whatsapp-assistance";
import { ToastProvider } from "@/components/ui/toast";
import { getPublicCatalog, getPublicCatalogFacets } from "@/server/backend-api-client";
import { ShopCatalog } from "@/features/catalog/shop-catalog";

export const metadata: Metadata = {
  title: "Shop Marble Moorties",
  description:
    "Explore hand-carved marble moorties for home mandirs, temples and custom sacred spaces from Divine Stone Gallery.",
  alternates: { canonical: "/shop" },
};

// Catalogue changes made in Admin must be visible on the next storefront request.
export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const [products, facets] = await Promise.all([getPublicCatalog(), getPublicCatalogFacets()]);
  return (
    <ToastProvider>
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <Suspense fallback={<div className="site-container" aria-live="polite">Preparing the marble collection…</div>}>
          <ShopCatalog products={products} availableCategories={facets.categories} availableDeities={facets.deities} breadcrumbs={<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop" }]} />} />
        </Suspense>
      </main>
      <SiteFooter />
      <WhatsAppAssistance />
      <CookieConsent />
    </ToastProvider>
  );
}
