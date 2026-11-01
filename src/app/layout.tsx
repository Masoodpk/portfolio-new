import type { Metadata, Viewport } from "next";
import { Archivo, Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SkipLink } from "@/components/layout/SkipLink";
import { profile } from "@/content/profile";
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
});

// Full SEO metadata (OG, canonical, JSON-LD) is completed in Stage 6.
export const metadata: Metadata = {
  title: {
    default: `${profile.name} — ${profile.title} | Vue.js, Nuxt.js, React & Next.js`,
    template: `%s | ${profile.name}`,
  },
  description: `${profile.name} is a ${profile.title.toLowerCase()} with ${profile.experienceSummary} of experience building production web applications with Vue.js, Nuxt.js, React and Next.js. ${profile.availability}.`,
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
      </body>
    </html>
  );
}
