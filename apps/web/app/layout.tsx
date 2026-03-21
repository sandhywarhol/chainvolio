import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/wallet/WalletProvider";

import { AppBackground } from "@/components/layout/AppBackground";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.chainvolio.xyz/"),
  title: "ChainVolio — Verifiable Professional Identity for Web3",
  description: "Build a verifiable on-chain professional identity. Showcase achievements, trust signals, and reputation for Web3 careers.",
  applicationName: "ChainVolio",
  keywords: ["Web3", "Blockchain", "Professional Identity", "On-Chain Resume", "Verifiable Credentials", "Solana", "Digital Reputation"],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "16x16", type: "image/png" },
      { url: "/logo.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "ChainVolio — Verifiable Professional Identity for Web3",
    description: "Build a verifiable on-chain professional identity. Showcase achievements, trust signals, and reputation for Web3 careers.",
    url: "https://www.chainvolio.xyz/",
    siteName: "ChainVolio",
    images: [
      {
        url: "/homepage/og%20image%20for%20all.jpg?v=5",
        width: 1200,
        height: 630,
        alt: "ChainVolio: Professional Trust Infrastructure",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChainVolio — Verifiable Professional Identity for Web3",
    description: "The on-chain standard for professional identity and verifiable career milestones.",
    images: ["/homepage/og%20image%20for%20all.jpg?v=5"],
    creator: "@chainvolio",
    site: "@chainvolio",
  },
  verification: {
    google: "Crb2ONV_uh-J55SnH6dCcCzSrbNDVlEISKSq51FkKpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans min-h-screen text-white relative`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "ChainVolio",
              "url": "https://www.chainvolio.xyz/",
              "logo": "https://www.chainvolio.xyz/logo.png",
              "description": "Build a verifiable on-chain professional identity. Showcase achievements, trust signals, and reputation for Web3 careers.",
              "sameAs": [
                "https://x.com/chainvolio",
                "https://github.com/sandhywarhol/chainvolio"
              ]
            })
          }}
        />
        <AppBackground />
        <div className="relative z-[60]">
          <WalletProvider>{children}</WalletProvider>
        </div>
      </body>
    </html>
  );
}
