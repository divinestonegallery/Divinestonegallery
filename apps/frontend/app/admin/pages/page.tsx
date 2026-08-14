import type { Metadata } from "next";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { PageBuilderAdmin } from "@/features/admin/page-builder-admin";

export const metadata: Metadata = { title: "Pages & sections" };

export default function AdminPagesPage() {
  return <><AdminPageHeader eyebrow="Website" title="Pages & sections" description="Build and organize website pages using safe, reusable content blocks—without touching code." /><PageBuilderAdmin /></>;
}
