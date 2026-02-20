import { Metadata } from "next";

export const metadata: Metadata = {
    title: "ChainVolio Verified Profile — On-Chain Career Identity",
    description: "View a cryptographically verified work history and professional proof of work.",
};

export default function CVLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
