import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Verify Proof of Work — ChainVolio Attestation",
    description: "Sign a cryptographic attestation to verify a colleague's professional work history on-chain.",
};

export default function AttestLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
