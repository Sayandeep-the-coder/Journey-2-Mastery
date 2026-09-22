import type { Metadata } from "next";
import { Inter, Zilla_Slab, Permanent_Marker } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

import localFont from "next/font/local";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const onari = localFont({
  src: "../fonts/ONARI-PersonalUse.otf",
  variable: "--font-onari-local",
});

const zillaSlab = Zilla_Slab({
  variable: "--font-zilla",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const marker = Permanent_Marker({
  variable: "--font-marker",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Journey to Mastery | DC KGEC",
  description: "An intensive 4-week gamified coding quest by Developers Community KGEC. Build a live product, get expert reviews, and rank up from Ronin to Shogun.",
  keywords: ["hackathon", "coding quest", "Developers Community", "DC KGEC", "web development", "mentorship"],
  openGraph: {
    title: "Journey to Mastery | DC KGEC",
    description: "An intensive 4-week gamified coding quest by Developers Community KGEC. Build a live product, get expert reviews, and rank up from Ronin to Shogun.",
    url: "https://dc.kgec.tech",
    siteName: "Journey to Mastery",
    images: [
      {
        url: "/j2m-logo.png",
        width: 800,
        height: 800,
        alt: "Journey to Mastery Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Journey to Mastery | DC KGEC",
    description: "An intensive 4-week gamified coding quest by Developers Community KGEC.",
    images: ["/j2m-logo.png"],
  },
};

import QueryProvider from "@/components/providers/QueryProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${zillaSlab.variable} ${marker.variable} ${onari.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col font-sans">
        <QueryProvider>
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </QueryProvider>
      </body>
    </html>
  );
}
