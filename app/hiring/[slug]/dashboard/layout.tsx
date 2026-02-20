import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Recruiter Dashboard — ChainVolio HIRE",
    description: "Manage candidates and evaluate verified on-chain work history for your hiring collection.",
};

export default function RecruiterDashboardLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
