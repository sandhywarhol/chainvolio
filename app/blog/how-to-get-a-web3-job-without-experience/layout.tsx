import { buildBlogMetadata } from "@/lib/blog/metadata";

export const metadata = buildBlogMetadata("how-to-get-a-web3-job-without-experience");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
