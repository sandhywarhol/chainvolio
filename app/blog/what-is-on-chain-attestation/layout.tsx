import { buildBlogMetadata } from "@/lib/blog/metadata";

export const metadata = buildBlogMetadata("what-is-on-chain-attestation");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
