import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getCurrentStaffAccess } from "@/auth/admin";
import { AdminState } from "@/features/admin/admin-state";
import { CatalogAdmin } from "@/features/admin/catalog-admin";
import { CustomerPageShell } from "@/features/customer/customer-page-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Product Administration",
  description: "Staff-only Divine Stone Gallery product administration.",
  robots: { index: false, follow: false },
};

export default async function AdminProductsPage() {
  const access = await getCurrentStaffAccess();
  if (access.status === "signed-out") redirect("/sign-in?redirect_url=/admin/products");

  return (
    <CustomerPageShell
      title="Product administration"
      eyebrow="Staff catalogue"
      intro="Manage catalogue visibility, pricing, GST, inventory and shipping details from one protected workspace."
      note={<><ShieldCheck aria-hidden="true" size={18} /><span>All changes require a full-access staff account and are recorded in the audit log.</span></>}
    >
      {access.status === "authorized" ? <CatalogAdmin /> : <AdminState reason={access.status} />}
    </CustomerPageShell>
  );
}
