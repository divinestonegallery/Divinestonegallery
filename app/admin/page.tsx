import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BellRing, Boxes, ChevronRight, Hammer, ShieldCheck } from "lucide-react";
import { getCurrentStaffAccess } from "@/auth/admin";
import { AdminState } from "@/features/admin/admin-state";
import { CustomerPageShell } from "@/features/customer/customer-page-shell";
import styles from "./admin-dashboard.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery Administration",
  description: "Protected Divine Stone Gallery staff workspace.",
  robots: { index: false, follow: false },
};

const workspaces = [
  {
    href: "/admin/products",
    title: "Products",
    description: "Create products and manage catalogue visibility, pricing, GST, inventory, variants and images.",
    icon: Boxes,
  },
  {
    href: "/admin/commissions",
    title: "Custom commissions",
    description: "Review requests, prepare quotations and share production milestones for customer approval.",
    icon: Hammer,
  },
  {
    href: "/admin/notifications",
    title: "Notifications",
    description: "Review delivery status and process queued customer email, SMS and WhatsApp updates.",
    icon: BellRing,
  },
];

export default async function AdminPage() {
  const access = await getCurrentStaffAccess();
  if (access.status === "signed-out") redirect("/sign-in?redirect_url=/admin");

  return (
    <CustomerPageShell
      title="Gallery administration"
      eyebrow="Protected staff workspace"
      intro="Manage the Divine Stone Gallery catalogue and customer work from one secure place."
      note={<><ShieldCheck aria-hidden="true" size={18} /><span>Your identity and active staff permission are checked whenever this page opens.</span></>}
    >
      {access.status === "authorized" ? (
        <section className={styles.section}>
          <div className="site-container">
            <div className={styles.confirmation} role="status">
              <ShieldCheck aria-hidden="true" size={22} />
              <div>
                <strong>Full-access administrator</strong>
                <span>Your staff access is active.</span>
              </div>
            </div>
            <div className={styles.grid}>
              {workspaces.map(({ href, title, description, icon: Icon }) => (
                <Link className={styles.card} href={href} key={href}>
                  <Icon aria-hidden="true" size={25} />
                  <div>
                    <h2 className="font-display">{title}</h2>
                    <p>{description}</p>
                  </div>
                  <ChevronRight aria-hidden="true" className={styles.arrow} size={20} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : <AdminState reason={access.status} />}
    </CustomerPageShell>
  );
}
