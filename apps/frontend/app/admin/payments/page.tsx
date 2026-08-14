import type { Metadata } from "next";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { PaymentsAdmin } from "@/features/admin/commerce-operations-admin";
export const metadata: Metadata = { title: "Payments" };
export default function AdminPaymentsPage() { return <><AdminPageHeader eyebrow="Commerce" title="Payments" description="Reconcile Razorpay, bank-transfer and COD records, with protected manual corrections and audit history." /><PaymentsAdmin /></>; }
