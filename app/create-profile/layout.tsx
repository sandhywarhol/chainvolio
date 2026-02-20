import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create Your Profile — ChainVolio",
    description: "Set up your on-chain professional profile and start proving your work history.",
};

export default function CreateProfileLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
