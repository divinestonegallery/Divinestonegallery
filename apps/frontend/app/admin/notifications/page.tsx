import type { Metadata } from "next";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { NotificationAdmin } from "@/features/admin/notification-admin";

export const metadata: Metadata = { title: "Notifications" };

export default function AdminNotificationsPage() {
  return (
    <>
      <AdminPageHeader eyebrow="Customer communication" title="Notifications" description="Monitor transactional email, SMS and WhatsApp delivery from one protected queue." />
      <div className="admin-embedded-workspace"><NotificationAdmin /></div>
    </>
  );
}
