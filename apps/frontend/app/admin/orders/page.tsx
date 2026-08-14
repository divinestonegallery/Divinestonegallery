import type { Metadata } from "next";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { OrdersAdmin } from "@/features/admin/commerce-operations-admin";
export const metadata: Metadata = { title: "Orders" };
export default function AdminOrdersPage() { return <><AdminPageHeader eyebrow="Commerce" title="Orders" description="Review every order, approve COD requests and coordinate payment, production and fulfilment status." /><OrdersAdmin /></>; }
