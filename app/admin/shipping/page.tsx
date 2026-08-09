import type { Metadata } from "next";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { ShippingAdmin } from "@/features/admin/commerce-operations-admin";
export const metadata: Metadata = { title: "Shipping" };
export default function AdminShippingPage() { return <><AdminPageHeader eyebrow="Commerce" title="Shipping" description="Manage Shiprocket shipment IDs, courier service, tracking, exceptions and delivery milestones." /><ShippingAdmin /></>; }
