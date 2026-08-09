import type { Metadata } from "next";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { CatalogAdmin } from "@/features/admin/catalog-admin";

export const metadata: Metadata = { title: "Products" };

export default function AdminProductsPage() {
  return (
    <>
      <AdminPageHeader eyebrow="Catalogue" title="Products" description="Create products and manage catalogue visibility, pricing, GST, inventory, shipping details, variants and images." />
      <CatalogAdmin />
    </>
  );
}
