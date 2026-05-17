import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "System Status",
    description: "Real-time status of ChainVolio services, API availability, and infrastructure health.",
    openGraph: {
        title: "System Status | ChainVolio",
        description: "Real-time status of ChainVolio services, API availability, and infrastructure health.",
    },
    twitter: {
        title: "System Status | ChainVolio",
    },
};

export default function StatusLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
