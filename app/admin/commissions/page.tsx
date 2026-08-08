import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getCurrentStaffAccess } from "@/auth/admin";
import { AdminState } from "@/features/admin/admin-state";
import { CustomerPageShell } from "@/features/customer/customer-page-shell";
import { AdminCommissions } from "@/features/commissions/admin-commissions";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Commission Administration", robots: { index: false, follow: false } };
export default async function Page() { const access = await getCurrentStaffAccess(); if (access.status === "signed-out") redirect("/sign-in?redirect_url=/admin/commissions"); return <CustomerPageShell title="Commission administration" eyebrow="Staff production workspace" intro="Prepare individual quotations, create major making milestones and send progress for customer approval." note={<><ShieldCheck size={18} /><span>Every quotation, milestone submission and customer decision is retained in the audit record.</span></>}>{access.status === "authorized" ? <AdminCommissions /> : <AdminState reason={access.status} />}</CustomerPageShell>; }
