import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { THEME_CRITICAL_CSS } from "@/lib/themeCritical";
import { Providers } from "@/components/shared/Providers";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

const fontDisplay = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});
const fontSans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const fontMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Verity — Markets in Truth",
  description:
    "Verity is a decentralized prediction market protocol. Trade on the outcomes of real-world events with parimutuel pools, on-chain oracles, and automated payouts.",
  icons: [{ rel: "icon", url: "/favicon.svg", type: "image/svg+xml" }],
  openGraph: {
    title: "Verity — Markets in Truth",
    description:
      "Decentralized prediction markets with parimutuel pools, on-chain oracles, and automated payouts.",
    siteName: "Verity",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0B0A08" },
    { media: "(prefers-color-scheme: light)", color: "#F6F3EA" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable}`}
    >
      <body suppressHydrationWarning>
        {/* Design tokens ship inline so the theme survives a failed CSS chunk
            (e.g. CDN skew right after a deploy). Source: lib/themeCritical.ts */}
        <style id="verity-critical" dangerouslySetInnerHTML={{ __html: THEME_CRITICAL_CSS }} />
        <Providers>
          <Navbar />
          <main style={{ minHeight: "100vh" }}>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
