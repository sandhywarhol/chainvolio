import { Metadata } from "next";

export const metadata: Metadata = {
    title: "ChainVolio Dashboard — Manage Your Work Identity",
    description: "Manage your professional proof of work receipts and on-chain identity.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
