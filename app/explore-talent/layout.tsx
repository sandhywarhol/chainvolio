import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Discover Verified Web3 Talent",
    description: "Browse verified Web3 builders, creators, and developers with on-chain proof of work and CV scores. Filter by skill, country, and attestation depth.",
    openGraph: {
        title: "Discover Verified Web3 Talent | ChainVolio",
        description: "Browse verified Web3 builders, creators, and developers with on-chain proof of work and CV scores.",
    },
    twitter: {
        title: "Discover Verified Web3 Talent | ChainVolio",
    },
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
