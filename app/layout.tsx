import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/_components/Navbar";
import Footer from "@/app/_components/Footer";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkyBookFare — Find & Book Cheap Flights",
  description: "Search and compare cheap flights across all major US airlines. Book flights with no booking fees, real prices, and free cancellation on select fares.",
  keywords: ["cheap flights", "flight search", "book flights", "airline tickets", "flight deals", "SkyBookFare", "skybookfare"],
  metadataBase: new URL("https://skybookfare.com"),
  openGraph: {
    title: "SkyBookFare — Find & Book Cheap Flights",
    description: "Search and compare cheap flights across all major US airlines. No booking fees, real prices.",
    type: "website",
    siteName: "SkyBookFare",
    url: "https://skybookfare.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkyBookFare — Find & Book Cheap Flights",
    description: "Compare flights across all major US airlines. Book with no fees.",
  },
  robots: { index: true, follow: true },
  verification: { google: 'Oc2hn6VGpPjZIKFFe5NXMSM5umF3tkQpM90WZGAWXwU' },
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
        <Analytics />

        {/* Structured data — Organization + WebSite (sitelinks search box) */}
        <Script id="schema-org" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "SkyBookFare",
            "url": "https://skybookfare.com",
            "logo": "https://skybookfare.com/logo.png",
            "description": "Search and compare cheap flights across all major US airlines. No booking fees, real prices.",
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+1-800-759-2665",
              "contactType": "customer support",
              "availableLanguage": "English",
              "areaServed": "US"
            },
            "sameAs": []
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "SkyBookFare",
            "url": "https://skybookfare.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://skybookfare.com/search?from={from}&to={to}&date={date}&passengers=1&cabinClass=economy&tripType=roundTrip"
              },
              "query-input": "required name=from"
            }
          }
        ]) }} />

        <Script id="clarity" strategy="afterInteractive">{`
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "x6n2xcgrs4");
        `}</Script>
      </body>
    </html>
  );
}
