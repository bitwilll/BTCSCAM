import type { Metadata } from "next";
import { Fraunces, Geist, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// v4 faces: Fraunces 600 (headlines/titles ONLY) · Geist (all UI/body) ·
// IBM Plex Mono (addresses/txids/prices ONLY)
const fraunces = Fraunces({
  weight: "variable",
  axes: ["opsz"],
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const geist = Geist({
  weight: ["400", "500", "700", "900"],
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  weight: ["500", "600", "700"],
  variable: "--font-plex-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BTCSCAM.COM — Community-Verified Scam Intelligence",
    template: "%s · BTCSCAM.COM",
  },
  description:
    "Expose scams, verify reports, protect the community. Independent crypto-scam intelligence, alerts, and a community-run database. Not financial advice — verify everything.",
  metadataBase: new URL("https://btcscam.com"),
  openGraph: {
    title: "BTCSCAM.COM — Community-Verified Scam Intelligence",
    description: "Expose scams, verify reports, protect the community.",
    siteName: "BTCSCAM.COM",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${geist.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">{children}</body>
    </html>
  );
}
