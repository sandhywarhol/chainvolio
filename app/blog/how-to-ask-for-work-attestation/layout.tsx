import { buildBlogMetadata } from "@/lib/blog/metadata";

export const metadata = buildBlogMetadata("how-to-ask-for-work-attestation");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
