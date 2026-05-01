import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/wallet/WalletProvider";

import { AppBackground } from "@/components/layout/AppBackground";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.chainvolio.xyz/"),
  title: {
    default: "ChainVolio - Verifiable Identity for Web3",
    template: "%s | ChainVolio"
  },
  description: "Build a work history that can’t be faked. Backed by on-chain proof and attestations.",
  applicationName: "ChainVolio",
  generator: "ChainVolio",
  keywords: ["Web3", "Solana", "Professional Identity", "On-chain Resume", "Verifiable Credentials", "Trust Infrastructure", "Career", "Blockchain"],
  authors: [{ name: "ChainVolio" }],
  creator: "ChainVolio",
  publisher: "ChainVolio",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ChainVolio - Verifiable Identity for Web3",
    description: "Build a work history that can’t be faked. Backed by on-chain proof and attestations.",
    url: "https://www.chainvolio.xyz/",
    siteName: "ChainVolio",
    images: [
      {
        url: "/homepage/og%20image%20for%20all.jpg?v=5",
        width: 1200,
        height: 630,
        alt: "ChainVolio: Verifiable Identity for Web3",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChainVolio - Verifiable Identity for Web3",
    description: "Build a work history that can’t be faked. Backed by on-chain proof and attestations.",
    images: ["/homepage/og%20image%20for%20all.jpg?v=5"],
    creator: "@chainvolio",
    site: "@chainvolio",
  },
  verification: {
    google: "Crb2ONV_uh-J55SnH6dCcCzSrbNDVlEISKSq51FkKpg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans min-h-screen text-white relative`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "ChainVolio",
              "url": "https://www.chainvolio.xyz/",
              "logo": "https://www.chainvolio.xyz/logo.png",
              "description": "Build a work history that can’t be faked. Backed by on-chain proof and attestations.",
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
