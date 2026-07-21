import type { Metadata } from "next";
import { Anton, Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const anton = Anton({
  weight: "400",
  variable: "--font-anton",
  subsets: ["latin"],
  display: "swap",
});

const archivo = Archivo({
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
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
      className={`${anton.variable} ${archivo.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">{children}</body>
    </html>
  );
}
