import type { Metadata } from "next";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { SettingsAdmin } from "@/features/admin/system-admin";
export const metadata: Metadata = { title: "Settings" };
export default function SettingsPage() { return <><AdminPageHeader eyebrow="System" title="Gallery settings" description="Maintain business identity, commerce display rules and customer notification preferences." /><SettingsAdmin /></>; }
