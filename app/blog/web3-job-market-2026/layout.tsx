import { buildBlogMetadata } from "@/lib/blog/metadata";

export const metadata = buildBlogMetadata("web3-job-market-2026");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
