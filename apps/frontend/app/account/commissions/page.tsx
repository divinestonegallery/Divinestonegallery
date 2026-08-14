import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getCurrentSessionStatus } from "@/server/backend-api-client";
import { CustomerPageShell } from "@/features/customer/customer-page-shell";
import { CustomerCommissions } from "@/features/commissions/customer-commissions";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My Custom Commissions", robots: { index: false, follow: false } };
export default async function Page() { const session = await getCurrentSessionStatus(); if (session.configured && !session.authenticated) redirect("/sign-in?redirect_url=/account/commissions"); return <CustomerPageShell title="Your custom commissions" eyebrow="Private making journey" intro="Review quotations, reference images, production milestones and approvals in one secure place." note={<><ShieldCheck size={18} /><span>Only you and authorised gallery staff can open these commission records.</span></>}><CustomerCommissions /></CustomerPageShell>; }
