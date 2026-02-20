import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Recruit with ChainVolio — Create a Hiring Collection",
    description: "Set up a verifiable recruitment collection to find top Web3 talent with proven work history.",
};

export default function HiringCreateLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
