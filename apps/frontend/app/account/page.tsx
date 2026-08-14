import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getCurrentSessionStatus } from "@/server/backend-api-client";
import { AccountHub } from "@/features/customer/account-hub";
import { CustomerPageShell } from "@/features/customer/customer-page-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery Account",
  description: "Your private Divine Stone Gallery account, wishlist, orders and commissions.",
  alternates: { canonical: "/account" },
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const session = await getCurrentSessionStatus();

  if (session.configured && !session.authenticated) redirect("/sign-in");

  return (
    <CustomerPageShell
      title="Your gallery account"
      eyebrow="Personal gallery space"
      intro="One secure place for saved works, addresses, orders and custom-moorti approvals."
      note={
        <>
          <ShieldCheck aria-hidden="true" size={18} />
          <span>
            {session.configured
              ? "Your identity is verified by Clerk; passwords and OTP codes are never stored by Divine Stone Gallery."
              : "Clerk is integrated. Registration opens as soon as the private application keys are added."}
          </span>
        </>
      }
    >
      <AccountHub />
    </CustomerPageShell>
  );
}
