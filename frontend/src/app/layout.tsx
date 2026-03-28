import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/shared/Providers";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "PredictX — Decentralized Prediction Markets",
  description: "Trade on outcomes of real-world events with trustless smart contracts.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <Navbar />
          <main style={{ paddingTop: 64, minHeight: "100vh" }}>
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
