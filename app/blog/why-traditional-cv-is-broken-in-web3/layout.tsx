import { buildBlogMetadata } from "@/lib/blog/metadata";

export const metadata = buildBlogMetadata("why-traditional-cv-is-broken-in-web3");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
