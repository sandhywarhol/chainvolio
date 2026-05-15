import { buildBlogMetadata } from "@/lib/blog/metadata";

export const metadata = buildBlogMetadata("linkedin-vs-chainvolio-why-you-need-both");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
