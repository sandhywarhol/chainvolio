import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Whitepaper",
    description: "ChainVolio technical whitepaper — architecture, trust model, and the future of verifiable professional identity on Solana.",
    openGraph: {
        title: "Whitepaper | ChainVolio",
        description: "ChainVolio technical whitepaper — architecture, trust model, and the future of verifiable professional identity on Solana.",
    },
    twitter: {
        title: "Whitepaper | ChainVolio",
    },
};

export default function WhitepaperLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
