import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);
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
        {children}
      </body>
    </html>
  );
}
