import { buildBlogMetadata } from "@/lib/blog/metadata";

export const metadata = buildBlogMetadata("what-recruiters-look-for-in-web3-talent");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
