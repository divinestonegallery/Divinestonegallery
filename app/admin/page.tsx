import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Boxes,
  CircleDollarSign,
  Hammer,
  ImagePlus,
  Plus,
  ShoppingBag,
  UsersRound,
} from "lucide-react";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { getAdminDashboardSummary } from "@/features/admin/dashboard-repository";
import styles from "./admin-dashboard.module.css";

export const metadata: Metadata = { title: "Overview" };

function money(paise: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(paise / 100);
}

function label(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function AdminPage() {
  const summary = await getAdminDashboardSummary();
  const metrics = [
    { label: "Active products", value: summary.products.active, detail: `${summary.products.drafts} drafts`, icon: Boxes, tone: "gold" },
    { label: "Open orders", value: summary.orders.open, detail: `${summary.orders.approvalPending} need approval`, icon: ShoppingBag, tone: "blue" },
    { label: "Open commissions", value: summary.commissions.open, detail: `${summary.commissions.awaitingApproval} awaiting approval`, icon: Hammer, tone: "purple" },
    { label: "Customers", value: summary.customers.total, detail: "Active accounts", icon: UsersRound, tone: "green" },
    { label: "Paid order value", value: money(summary.orders.paidRevenuePaise), detail: "Recorded online revenue", icon: CircleDollarSign, tone: "teal" },
    { label: "Message queue", value: summary.notifications.queued, detail: `${summary.notifications.failed} failed`, icon: BellRing, tone: summary.notifications.failed ? "red" : "green" },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="Store control centre"
        title="Good to see you."
        description="Review the gallery’s live operational status and continue with the work that needs attention."
        actions={<Link className={styles.primaryAction} href="/admin/products"><Plus size={16} /> Add product</Link>}
      />

      <section className={styles.metrics} aria-label="Store overview">
        {metrics.map(({ label: metricLabel, value, detail, icon: Icon, tone }) => (
          <article className={styles.metric} data-tone={tone} key={metricLabel}>
            <div><span>{metricLabel}</span><Icon aria-hidden="true" size={19} /></div>
            <strong>{value}</strong><small>{detail}</small>
          </article>
        ))}
      </section>

      <section className={styles.quickSection}>
        <div className={styles.sectionTitle}><div><p>Quick actions</p><h2 className="font-display">Continue your work</h2></div></div>
        <div className={styles.quickGrid}>
          <Link href="/admin/products"><Plus size={18} /><span><strong>Create a product</strong><small>Add details, pricing, stock and variants</small></span><ArrowRight size={16} /></Link>
          <Link href="/admin/products"><ImagePlus size={18} /><span><strong>Upload product media</strong><small>Add optimized images through ImageKit</small></span><ArrowRight size={16} /></Link>
          <Link href="/admin/commissions"><Hammer size={18} /><span><strong>Review commissions</strong><small>Prepare quotes and update milestones</small></span><ArrowRight size={16} /></Link>
          <Link href="/admin/notifications"><BellRing size={18} /><span><strong>Process notifications</strong><small>Review queued and failed messages</small></span><ArrowRight size={16} /></Link>
        </div>
      </section>

      <section className={styles.activityGrid}>
        <article className={styles.activityCard}>
          <header><div><p>Commerce</p><h2 className="font-display">Recent orders</h2></div><span>{summary.orders.total} total</span></header>
          {!summary.recentOrders.length ? <div className={styles.empty}><ShoppingBag size={22} /><p>No orders have been placed yet.</p></div> : (
            <div className={styles.rows}>{summary.recentOrders.map((order) => <div key={order.orderNumber}><span><strong>{order.orderNumber}</strong><small>{new Date(order.placedAt * 1000).toLocaleDateString("en-IN")}</small></span><span><b>{money(order.totalPaise)}</b><small>{label(order.paymentStatus)}</small></span><em>{label(order.status)}</em></div>)}</div>
          )}
          <div className={styles.moduleNotice}>Complete order management will be added in the Commerce build step.</div>
        </article>

        <article className={styles.activityCard}>
          <header><div><p>Atelier</p><h2 className="font-display">Recent commissions</h2></div><Link href="/admin/commissions">View all <ArrowRight size={14} /></Link></header>
          {!summary.recentCommissions.length ? <div className={styles.empty}><Hammer size={22} /><p>No commission requests yet.</p></div> : (
            <div className={styles.rows}>{summary.recentCommissions.map((commission) => <Link href="/admin/commissions" key={commission.commissionNumber}><span><strong>{commission.commissionNumber}</strong><small>{commission.title}</small></span><em>{label(commission.status)}</em></Link>)}</div>
          )}
        </article>
      </section>
    </>
  );
}
