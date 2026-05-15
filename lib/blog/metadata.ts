import { Metadata } from "next";
import { getArticle } from "./articles";

const BASE_URL = "https://www.chainvolio.xyz";

export function buildBlogMetadata(slug: string): Metadata {
  const article = getArticle(slug);
  if (!article) return { title: "Blog | ChainVolio" };

  const ogImageUrl = `${BASE_URL}/og%20image/OG%20Image%20Homepage.png`;

  return {
    title: `${article.title} | ChainVolio`,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      url: `${BASE_URL}/blog/${slug}`,
      siteName: "ChainVolio",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: [ogImageUrl],
      site: "@chainvolio",
    },
  };
}
