import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Developer Docs",
    description: "Technical documentation for integrating ChainVolio APIs, attestation infrastructure, and on-chain CV verification.",
    openGraph: {
        title: "Developer Docs | ChainVolio",
        description: "Technical documentation for integrating ChainVolio APIs and attestation infrastructure.",
    },
    twitter: {
        title: "Developer Docs | ChainVolio",
    },
};

export default function DevelopersLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
