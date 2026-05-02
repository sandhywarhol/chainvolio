import type { Metadata } from "next";
import { Web3ResumePage } from "@/components/landing/Web3ResumePage";

export const metadata: Metadata = {
    title: "What is a Web3 Resume? | ChainVolio",
    description: "A Web3 resume is a verifiable on-chain work history backed by cryptographic attestations. Learn how ChainVolio lets you build a tamper-proof resume recruiters can instantly trust.",
    openGraph: {
        title: "What is a Web3 Resume? | ChainVolio",
        description: "Turn your work experience into verifiable on-chain proof. Build a Web3 resume that recruiters can instantly trust.",
        url: "https://chainvolio.com/web3-resume",
        siteName: "ChainVolio",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "What is a Web3 Resume? | ChainVolio",
        description: "Turn your work experience into verifiable on-chain proof. No fake CVs. No manual checks. Just trust.",
    },
    alternates: {
        canonical: "https://chainvolio.com/web3-resume",
    },
};

export default function Web3ResumeRoute() {
    return <Web3ResumePage />;
}
