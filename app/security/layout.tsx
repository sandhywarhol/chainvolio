import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Security & Trust Architecture | ChainVolio",
    description: "On-chain verification and tamper-proof professional records powered by Solana consensus.",
    openGraph: {
        title: "Security & Trust Architecture",
        description: "On-Chain Verification. Tamper-Proof Records. Powered by Solana.",
    },
    twitter: {
        card: "summary_large_image",
        title: "Security & Trust Architecture",
        description: "On-Chain Verification. Tamper-Proof Records. Powered by Solana.",
    },
};

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
