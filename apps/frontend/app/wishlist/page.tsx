import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { getPublicCatalog } from "@/server/backend-api-client";
import { CustomerPageShell } from "@/features/customer/customer-page-shell";
import { WishlistView } from "@/features/customer/wishlist-view";

export const metadata: Metadata = { title: "Wishlist", description: "Review marble works saved to your secure Divine Stone Gallery wishlist.", alternates: { canonical: "/wishlist" }, robots: { index: false, follow: true } };

export default async function WishlistPage() {
  const products = await getPublicCatalog();
  return <CustomerPageShell title="Your wishlist" eyebrow="Saved sacred works" intro="Keep thoughtful possibilities together while you compare deity, scale and finish." note={<><ShieldCheck aria-hidden="true" size={18} /><span>Works stay private on this device while signed out, then merge into your secure account and synchronize after sign-in.</span></>}><WishlistView products={products} /></CustomerPageShell>;
}
