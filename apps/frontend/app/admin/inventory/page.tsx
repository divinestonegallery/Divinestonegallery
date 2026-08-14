import type { Metadata } from "next";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { InventoryAdmin } from "@/features/admin/inventory-admin";

export const metadata: Metadata = { title: "Inventory" };

export default function AdminInventoryPage() {
  return (
    <>
      <AdminPageHeader eyebrow="Commerce" title="Inventory" description="Control available quantities, reservation-aware stock and low-stock alerts for every product variant." />
      <InventoryAdmin />
    </>
  );
}
