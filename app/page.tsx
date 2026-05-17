import { LandingPageClient } from "@/components/landing/LandingPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ChainVolio – Verifiable Web3 Resume & On-Chain CV",
  description:
    "Build a tamper-proof Web3 resume backed by on-chain attestations. No fake CVs. Recruiters verify your work history instantly. Built on Solana.",
  openGraph: {
    title: "ChainVolio – Verifiable Web3 Resume & On-Chain CV",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ChainVolio: Verifiable Identity for Web3" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ChainVolio – Verifiable Web3 Resume & On-Chain CV",
    images: ["/og-image.png"],
  },
};

export default function LandingPage() {
  return <LandingPageClient />;
}
