import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "API Documentation",
    description: "Complete API reference for integrating ChainVolio CV verification and attestation data into your application.",
    openGraph: {
        title: "API Documentation | ChainVolio",
        description: "Complete API reference for integrating ChainVolio CV verification and attestation data into your application.",
    },
    twitter: {
        title: "API Documentation | ChainVolio",
    },
};

export default function ApiDocsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
