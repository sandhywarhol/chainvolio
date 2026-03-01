import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About ChainVolio | Web3 Professional Identity Infrastructure",
    description: "ChainVolio is a primitive for professional trust, designed to make careers verifiable, portable, and owned by the individual builder.",
    openGraph: {
        title: "About ChainVolio",
        description: "On-Chain Professional Identity Infrastructure. Your Work. Verified.",
    },
    twitter: {
        card: "summary_large_image",
        title: "About ChainVolio",
        description: "On-Chain Professional Identity Infrastructure. Your Work. Verified.",
    },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
