import type { Metadata, Viewport } from "next";
import { Archivo, Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SkipLink } from "@/components/layout/SkipLink";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { profile } from "@/content/profile";
import { seo, siteUrl } from "@/lib/site";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  // Only used for small labels; don't let it compete with above-the-fold content.
  preload: false,
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
  themeColor: "#0b0b0c",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${geist.variable} ${geistMono.variable} antialiased`}
    >
      <body className="flex min-h-dvh flex-col text-fg">
        <SkipLink />
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <CustomCursor />
      </body>
    </html>
  );
}
