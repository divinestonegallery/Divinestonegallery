import type { Metadata } from "next";
import { AuthPage } from "@/features/auth/auth-page";
import { CustomerPageShell } from "@/features/customer/customer-page-shell";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in securely to your Divine Stone Gallery account.",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <CustomerPageShell
      title="Sign in"
      eyebrow="Your private gallery"
      intro="Return to saved works, enquiries, orders and custom-moorti approvals."
    >
      <AuthPage mode="sign-in" />
    </CustomerPageShell>
  );
}
