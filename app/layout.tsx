import type { Metadata } from "next";
import { Noto_Serif } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import PlausibleProvider from "next-plausible";
import Outbound from "@/components/outbound";
import { Providers } from './providers'

const notoSerif = Noto_Serif({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "한국어 해체자",
  description: "한국어 단어를 분석하고 이해하는 도구",
  metadataBase: new URL("https://your-domain.com"),
  openGraph: {
    title: "한국어 해체자",
    description: "한국어 단어를 분석하고 이해하는 도구",
    url: "https://your-domain.com",
    siteName: "한국어 해체자",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "한국어 해체자",
    description: "한국어 단어를 분석하고 이해하는 도구",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* <PlausibleProvider
          domain="deconstructor.ayush.digital"
          customDomain="https://a.ayush.digital"
          trackOutboundLinks
          selfHosted
          taggedEvents
        /> */}
      </head>
      <body className={`${notoSerif.className} antialiased bluelight`}>
        <Outbound />
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
