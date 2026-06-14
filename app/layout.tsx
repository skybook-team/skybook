import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/_components/Navbar";
import Footer from "@/app/_components/Footer";
import RecentBookingToast from "@/app/_components/RecentBookingToast";
import { Analytics } from "@vercel/analytics/next";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkyBook Fare — Find & Book Cheap Flights",
  description: "Search and compare cheap flights across all major US airlines. Book flights with no booking fees, real prices, and free cancellation on select fares.",
  keywords: ["cheap flights", "flight search", "book flights", "airline tickets", "flight deals", "SkyBook Fare", "skybookfare"],
  metadataBase: new URL("https://skybookfare.com"),
  openGraph: {
    title: "SkyBook Fare — Find & Book Cheap Flights",
    description: "Search and compare cheap flights across all major US airlines. No booking fees, real prices.",
    type: "website",
    siteName: "SkyBook Fare",
    url: "https://skybookfare.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkyBook Fare — Find & Book Cheap Flights",
    description: "Compare flights across all major US airlines. Book with no fees.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <RecentBookingToast />
        <Analytics />
      </body>
    </html>
  );
}
