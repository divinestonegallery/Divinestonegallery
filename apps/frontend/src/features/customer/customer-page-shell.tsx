import { ReactNode } from "react";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CookieConsent } from "@/components/site/cookie-consent";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { WhatsAppAssistance } from "@/components/site/whatsapp-assistance";
import { ToastProvider } from "@/components/ui/toast";
import styles from "./customer-page.module.css";

export function CustomerPageShell({ title, eyebrow, intro, note, children }: { title: string; eyebrow: string; intro: string; note?: ReactNode; children: ReactNode }) {
  return (
    <ToastProvider>
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <section className={styles.hero}>
          <div className="site-container">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: title }]} />
            <div className={styles.heroInner}>
              <p className={styles.eyebrow}>{eyebrow}</p>
              <h1 className="font-display">{title}</h1>
              <p>{intro}</p>
              {note ? <div className={styles.deviceNote}>{note}</div> : null}
            </div>
          </div>
        </section>
        {children}
      </main>
      <SiteFooter />
      <WhatsAppAssistance />
      <CookieConsent />
    </ToastProvider>
  );
}
