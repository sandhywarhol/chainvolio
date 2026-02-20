import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Why ChainVolio — The Trust Layer for Careers",
    description: "Learn why ChainVolio is the safest and most verifiable way to showcase your Web3 contributions.",
};

export default function WhyLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
