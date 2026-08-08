import type { Metadata } from "next";
import { AuthPage } from "@/features/auth/auth-page";
import { CustomerPageShell } from "@/features/customer/customer-page-shell";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a secure Divine Stone Gallery customer account.",
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return (
    <CustomerPageShell
      title="Create account"
      eyebrow="Your private gallery"
      intro="Create one secure account for purchases, saved works and custom-moorti approvals."
    >
      <AuthPage mode="sign-up" />
    </CustomerPageShell>
  );
}
