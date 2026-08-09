import type { Metadata } from "next";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { CustomersAdmin } from "@/features/admin/commerce-operations-admin";
export const metadata: Metadata = { title: "Customers" };
export default function AdminCustomersPage() { return <><AdminPageHeader eyebrow="Commerce" title="Customers" description="See customer value and activity, manage account access and maintain English or Hindi preferences." /><CustomersAdmin /></>; }
