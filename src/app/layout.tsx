import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Josephine Cosmetics & Jewelry | Kampala, Uganda",
    template: "%s | Josephine Cosmetics & Jewelry",
  },
  description:
    "Cosmetics, clothes, jewelry, ladies' heels and wigs in Kampala. Order online, pay with MTN Mobile Money or cash on delivery.",
  openGraph: { siteName: "Josephine Cosmetics & Jewelry", type: "website", locale: "en_UG" },
};

export const viewport: Viewport = { themeColor: "#0c0a0b" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
