import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Verification Tiers · ChainVolio",
    description: "Compare ChainVolio verification tiers. Get a verified badge, unlock attestation authority, and post trusted hiring listings in the Web3 ecosystem.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
