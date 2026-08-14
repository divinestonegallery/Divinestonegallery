import type { Metadata } from "next";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { CatalogStructureAdmin } from "@/features/admin/catalog-structure-admin";

export const metadata: Metadata = { title: "Catalogue organization" };

export default function AdminCatalogPage() {
  return (
    <>
      <AdminPageHeader eyebrow="Catalogue" title="Categories & collections" description="Organize products by category and deity, and build curated collections for festivals, stories and featured areas." />
      <CatalogStructureAdmin />
    </>
  );
}
