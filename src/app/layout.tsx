import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SkipLink } from "@/components/layout/SkipLink";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { WorldCanvas } from "@/components/world/WorldCanvas";
import { profile } from "@/content/profile";
import { seo, siteUrl } from "@/lib/site";
import "./globals.css";

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: seo.title, template: `%s | ${profile.name}` },
  description: seo.description,
  keywords: [...seo.keywords],
  authors: [{ name: profile.name, url: siteUrl }],
  creator: profile.name,
  applicationName: seo.siteName,
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    firstName: "Masood",
    lastName: "PK",
    siteName: seo.siteName,
    title: seo.title,
    description: seo.description,
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: seo.title,
    description: seo.description,
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  // Paste the token from Google Search Console → Settings → Ownership verification → HTML tag.
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#f2eee5",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${instrument.variable} ${manrope.variable} antialiased`}
    >
      <body className="flex min-h-dvh flex-col text-ink">
        <SkipLink />
        <SmoothScroll />
        <WorldCanvas />
        <SiteHeader />
        <main id="main" className="relative z-10 flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
