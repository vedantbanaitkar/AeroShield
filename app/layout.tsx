import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Providers } from "@/components/providers";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "AeroShield — Parametric Insurance on Algorand",
  description:
    "Flight delay insurance that pays you automatically. No claims, no paperwork, no waiting. Powered by Algorand smart contracts.",
  keywords: "parametric insurance, flight delay, blockchain, Algorand, DeFi",
  openGraph: {
    title: "AeroShield — Parametric Insurance on Algorand",
    description: "Flight delay insurance that pays you automatically.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn("font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body className="antialiased min-h-screen bg-background text-foreground">
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
