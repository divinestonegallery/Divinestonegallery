import type { Metadata } from "next";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { ReturnsAdmin } from "@/features/admin/commerce-operations-admin";
export const metadata: Metadata = { title: "Returns" };
export default function AdminReturnsPage() { return <><AdminPageHeader eyebrow="Commerce" title="Returns" description="Open and review return cases, record inspection decisions and coordinate receipt, refund and closure." /><ReturnsAdmin /></>; }
