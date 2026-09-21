import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import {
  DISCLAIMER,
  OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  THEME_COLOR,
} from "@/lib/site";
import { THEME_KEY } from "@/lib/theme";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const title = "Packet Tracer Labs - Lab Practice";
const description = "Practice previous labs to retain past knowledge.";

export const metadata: Metadata = {
  // Makes the relative OG/Twitter image URLs resolve to absolute ones, which
  // every scraper requires.
  metadataBase: new URL(SITE_URL),
  title: {
    default: title,
    template: `%s · ${SITE_NAME}`,
  },
  description,
  applicationName: SITE_NAME,
  keywords: [
    "Packet Tracer",
    "Packet Tracer labs",
    "Jeremy's IT Lab",
    "CCNA",
    "CCNA labs",
    "CCNA practice",
    "Cisco",
    "networking labs",
    "pkt files",
  ],
  // Carries the disclaimer into the <head>, so it's present for anything
  // reading metadata rather than rendered copy.
  other: { disclaimer: DISCLAIMER },
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title,
    description,
    locale: "en_US",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [OG_IMAGE.url],
  },
};

export const viewport: Viewport = {
  // Colours the embed strip in Discord/Slack and the browser chrome on mobile.
  themeColor: THEME_COLOR,
};

// Runs before the page paints, so a saved dark choice doesn't flash light first.
const applyTheme = `try{if(localStorage.getItem(${JSON.stringify(THEME_KEY)})==='dark')document.documentElement.dataset.theme='dark'}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: applyTheme }} />
        {children}
      </body>
    </html>
  );
}
