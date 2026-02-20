import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Apply with ChainVolio — Verified Professional Proof",
    description: "Submit your verifiable on-chain CV to a recruitment collection.",
};

export default function CandidatePortalLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
