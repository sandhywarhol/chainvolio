import { buildBlogMetadata } from "@/lib/blog/metadata";

export const metadata = buildBlogMetadata("why-web3-hiring-via-dm-is-broken");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
