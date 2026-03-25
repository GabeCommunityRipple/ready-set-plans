import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Ready Set Plans | Permit-Ready Deck Plans in 48 Hours",
  description: "Fast, affordable CAD drafting for deck builders. Submit a sketch, get permit-ready plans in 48 hours starting at $97.",
  metadataBase: new URL('https://readysetplans.com'),
  openGraph: {
    title: "Ready Set Plans | Permit-Ready Deck Plans in 48 Hours",
    description: "Fast, affordable CAD drafting for deck builders. Submit a sketch, get permit-ready plans in 48 hours starting at $97.",
    url: "https://readysetplans.com",
    siteName: "Ready Set Plans",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "Ready Set Plans",
      }
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ready Set Plans | Permit-Ready Deck Plans in 48 Hours",
    description: "Fast, affordable CAD drafting for deck builders. Submit a sketch, get permit-ready plans in 48 hours starting at $97.",
    images: ["/logo.png"],
  },
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
