import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const displayFont = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const metadataBase = new URL(
  configuredSiteUrl?.startsWith("http")
    ? configuredSiteUrl
    : "http://localhost:3000",
);

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Mint Tulsi | Fresh Holy Basil Delivered Across Nepal",
    template: "%s",
  },
  description:
    "Healthy Mint Tulsi plants delivered across Nepal with Cash on Delivery.",
  applicationName: "Mint Tulsi",
  category: "shopping",
  openGraph: {
    type: "website",
    locale: "en_NP",
    siteName: "Mint Tulsi",
    title: "Mint Tulsi — Fresh greenery, naturally yours",
    description:
      "Order for Rs 49. Buy 3 and get 1 free, with Cash on Delivery across Nepal.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Mint Tulsi — Fresh greenery, naturally yours",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mint Tulsi — Fresh greenery, naturally yours",
    description: "Order for Rs 49. Buy 3 and get 1 free.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#173f2b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body
        className={`${geistSans.variable} ${displayFont.variable} min-h-full antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
