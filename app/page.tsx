import { LandingPageClient } from "@/components/landing/LandingPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ChainVolio – Verifiable Web3 Resume & On-Chain CV",
  description:
    "Build a tamper-proof Web3 resume backed by on-chain attestations. No fake CVs. Recruiters verify your work history instantly. Built on Solana.",
  openGraph: {
    title: "ChainVolio – Verifiable Web3 Resume & On-Chain CV",
  },
  twitter: {
    title: "ChainVolio – Verifiable Web3 Resume & On-Chain CV",
  },
};

export default function LandingPage() {
  return <LandingPageClient />;
}
