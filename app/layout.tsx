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
  icons: {
    icon: "/logo%20black.png",
  },
  openGraph: {
    title: "ChainVolio: Professional Trust Primitive",
    description: "Web3-native professional infrastructure for verifiable careers and on-chain milestones.",
    url: "https://www.chainvolio.xyz/",
    siteName: "ChainVolio",
    images: [
      {
        url: "/og.png?v=10",
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
    images: ["/og.png?v=10"],
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
        <AppBackground />
        <div className="relative z-[60]">
          <WalletProvider>{children}</WalletProvider>
        </div>
      </body>
    </html>
  );
}
