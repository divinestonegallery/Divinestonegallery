import type { Metadata } from "next";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { AdminCommissions } from "@/features/commissions/admin-commissions";

export const metadata: Metadata = { title: "Commissions" };

export default function AdminCommissionsPage() {
  return (
    <>
      <AdminPageHeader eyebrow="Atelier workflow" title="Custom commissions" description="Prepare individual quotations, create major making milestones, and send progress for customer approval." />
      <div className="admin-embedded-workspace"><AdminCommissions /></div>
    </>
  );
}
