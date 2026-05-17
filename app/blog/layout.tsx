import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Insights & Guides",
    description: "Guides and insights on Web3 hiring, on-chain attestations, and building a verifiable professional identity on Solana.",
    openGraph: {
        title: "Insights & Guides | ChainVolio Blog",
        description: "Guides and insights on Web3 hiring, on-chain attestations, and building a verifiable professional identity on Solana.",
        type: "website",
    },
    twitter: {
        title: "Insights & Guides | ChainVolio Blog",
    },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
