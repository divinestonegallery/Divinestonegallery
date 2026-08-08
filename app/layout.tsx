import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getClerkPublishableKey } from "@/auth/config";
import { JsonLd } from "@/components/site/json-ld";
import { getSiteUrl } from "@/config/site";
import { GalleryAuthProvider } from "@/features/auth/auth-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateMetadata(): Metadata {
  const metadataBase = new URL(getSiteUrl());
  const description = "Authentic hand-carved marble moorties by fourth-generation master moortikars from Alwar, Rajasthan.";

  return {
    metadataBase,
    title: {
      default: "Divine Stone Gallery | Hand-Carved Marble Moorties",
      template: "%s | Divine Stone Gallery",
    },
    description,
    icons: {
      icon: "/brand/lotus-mark.jpg",
      shortcut: "/brand/lotus-mark.jpg",
      apple: "/brand/lotus-mark.jpg",
    },
    openGraph: {
      type: "website",
      title: "Divine Stone Gallery",
      description,
      siteName: "Divine Stone Gallery",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "Divine Stone Gallery — authentic hand-carved marble moorties" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Divine Stone Gallery",
      description,
      images: ["/og.png"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteUrl = getSiteUrl();
  const clerkPublishableKey = getClerkPublishableKey();
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Divine Stone Gallery",
    url: siteUrl,
    logo: `${siteUrl}/brand/lotus-mark.jpg`,
    foundingDate: "1960",
    description: "Fourth-generation family atelier creating hand-carved marble murtis in Alwar, Rajasthan.",
    areaServed: "IN",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-63768-71065",
      contactType: "customer service",
      availableLanguage: ["English", "Hindi"],
    },
  };

  return (
    <html
      lang="en"
      style={
        {
          "--font-brand-display":
            "'Iowan Old Style', Baskerville, 'Times New Roman', serif",
        } as React.CSSProperties
      }
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <GalleryAuthProvider publishableKey={clerkPublishableKey}>
          <JsonLd data={organizationSchema} />
          {children}
        </GalleryAuthProvider>
      </body>
    </html>
  );
}
