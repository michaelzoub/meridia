import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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

export const metadata: Metadata = {
  title:
    "ADHD Capital | Research firm — crypto, fintech, deep tech, and anything in between",
  description:
    "ADHD Capital is a research-led collective focused on crypto, fintech, deep tech, and anything in between. We publish memos, models, and data—capital is secondary to the work.",
  openGraph: {
    title: "ADHD Capital",
    description:
      "Research-first collective covering crypto, fintech, deep tech, and anything in between. Evidence, not headlines.",
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
