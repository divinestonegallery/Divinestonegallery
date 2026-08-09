import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentStaffAccess } from "@/auth/admin";
import { AdminShell } from "@/features/admin/admin-shell";
import { AdminState } from "@/features/admin/admin-state";
import { CustomerPageShell } from "@/features/customer/customer-page-shell";
import { ToastProvider } from "@/components/ui/toast";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s | Divine Stone Gallery Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const access = await getCurrentStaffAccess();
  if (access.status === "signed-out") redirect("/sign-in?redirect_url=/admin");

  if (access.status !== "authorized") {
    return (
      <CustomerPageShell
        title="Gallery administration"
        eyebrow="Protected staff workspace"
        intro="Sign in with an active Divine Stone Gallery staff account to continue."
      >
        <AdminState reason={access.status} />
      </CustomerPageShell>
    );
  }

  return <ToastProvider><AdminShell>{children}</AdminShell></ToastProvider>;
}
