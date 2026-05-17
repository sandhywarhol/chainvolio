import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Verified Organization",
    description: "Become a verified organization on ChainVolio and issue cryptographically signed attestations to your contributors.",
    openGraph: {
        title: "Verified Organization | ChainVolio",
        description: "Become a verified organization on ChainVolio and issue cryptographically signed attestations to your contributors.",
    },
    twitter: {
        title: "Verified Organization | ChainVolio",
    },
};

export default function VerifiedOrgLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
