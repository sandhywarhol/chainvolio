import { buildBlogMetadata } from "@/lib/blog/metadata";

export const metadata = buildBlogMetadata("how-to-build-web3-portfolio");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
