import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/wallet/WalletProvider";

import { AppBackground } from "@/components/layout/AppBackground";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.chainvolio.xyz/"),
  title: "ChainVolio: On-Chain Professional Trust Infrastructure",
  description: "The Web3 standard for professional identity. Your work. Verified. Permanent.",
  applicationName: "ChainVolio",
  icons: {
    icon: [
      { url: "https://www.chainvolio.xyz/logo.png", sizes: "32x32", type: "image/png" },
      { url: "https://www.chainvolio.xyz/logo.png", sizes: "16x16", type: "image/png" },
      { url: "https://www.chainvolio.xyz/logo.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "https://www.chainvolio.xyz/logo.png",
    apple: [
      { url: "https://www.chainvolio.xyz/logo.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "https://www.chainvolio.xyz/manifest.json",
  openGraph: {
    title: "ChainVolio: Professional Trust Primitive",
    description: "Web3-native professional infrastructure for verifiable careers and on-chain milestones.",
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
  },
  twitter: {
    card: "summary_large_image",
    title: "ChainVolio: Professional Trust Primitive",
    description: "The on-chain standard for professional identity and verifiable career milestones.",
    images: ["/homepage/og%20image%20for%20all.jpg?v=5"],
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
              "description": "On-chain professional identity and trust infrastructure for Web3 careers.",
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
