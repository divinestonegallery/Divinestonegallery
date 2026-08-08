import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getCurrentStaffAccess } from "@/auth/admin";
import { AdminState } from "@/features/admin/admin-state";
import { NotificationAdmin } from "@/features/admin/notification-admin";
import { CustomerPageShell } from "@/features/customer/customer-page-shell";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Notification Administration", robots: { index: false, follow: false } };
export default async function Page() { const access = await getCurrentStaffAccess(); if (access.status === "signed-out") redirect("/sign-in?redirect_url=/admin/notifications"); return <CustomerPageShell title="Notification delivery" eyebrow="Staff communications" intro="Monitor transactional email, SMS and WhatsApp delivery from one protected queue." note={<><ShieldCheck size={18} /><span>Only approved templates and server-side provider credentials can send customer messages.</span></>}>{access.status === "authorized" ? <NotificationAdmin /> : <AdminState reason={access.status} />}</CustomerPageShell>; }
