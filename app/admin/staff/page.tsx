import type { Metadata } from "next";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { StaffSecurityAdmin } from "@/features/admin/system-admin";
export const metadata: Metadata = { title: "Staff & security" };
export default function StaffPage() { return <><AdminPageHeader eyebrow="System" title="Staff & security" description="Control full staff access and review every important administrative change." /><StaffSecurityAdmin /></>; }
