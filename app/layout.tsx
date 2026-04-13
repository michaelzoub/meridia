import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Instrument_Serif } from "next/font/google";
import "./globals.css";

const geistSans = GeistSans;
const geistMono = GeistMono;

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://adhdcapital.xyz";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/icon.png", type: "image/png" }],
  },
  title:
    "Meridia | Research firm — crypto, fintech, deep tech, and anything in between",
  description:
    "Meridia is a research-led collective focused on crypto, fintech, deep tech, and anything in between. We publish memos, models, and data—capital is secondary to the work.",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Meridia",
    title: "Meridia",
    description:
      "Research-first collective covering crypto, fintech, deep tech, and anything in between.",
    images: [
      {
        url: "/adhd_banner.png",
        width: 1600,
        height: 529,
        alt: "Meridia — research firm",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Meridia",
    description:
      "Research-first collective covering crypto, fintech, deep tech, and anything in between.",
    images: ["/adhd_banner.png"],
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
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden bg-white text-zinc-900 md:overflow-x-visible">
        {children}
      </body>
    </html>
  );
}
