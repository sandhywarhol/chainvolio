import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/wallet/WalletProvider";

import { AppBackground } from "@/components/layout/AppBackground";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

export const metadata: Metadata = {
  title: "Chainvolio — CV On-Chain",
  description: "On-chain CV platform for Web3 talent",
  icons: {
    icon: "/chainvolio logo.png",
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
