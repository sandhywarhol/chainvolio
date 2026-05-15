import { ImageResponse } from "next/og";
import React from "react";
import { getArticle } from "@/lib/blog/articles";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug") ?? "";
    const article = getArticle(slug);

    const title = article?.title ?? "ChainVolio Blog";
    const description =
      article?.description ??
      "Insights about Web3, careers, and verifiable professional identity.";
    const category = article?.category ?? "Blog";
    const date = article?.date ?? "";
    const readTime = article?.readTime ?? "";
    const truncatedDesc =
      description.length > 130
        ? description.slice(0, 127) + "..."
        : description;

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#07070B",
            padding: "60px 72px",
          }}
        >
          {/* Top bar: logo + category badge */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* ChainVolio wordmark */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  backgroundColor: "#fde68a",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                <span
                  style={{ fontSize: 22, fontWeight: 900, color: "#07070B" }}
                >
                  C
                </span>
              </div>
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#ffffff",
                  letterSpacing: "-0.02em",
                }}
              >
                ChainVolio
              </span>
            </div>

            {/* Category badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 20px",
                backgroundColor: "rgba(253,230,138,0.1)",
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: "rgba(253,230,138,0.3)",
                borderRadius: 100,
                fontSize: 12,
                fontWeight: 700,
                color: "#fde68a",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              {category}
            </div>
          </div>

          {/* Main content: title + description */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              justifyContent: "center",
              paddingTop: 36,
              paddingBottom: 36,
            }}
          >
            <div
              style={{
                fontSize: title.length > 55 ? 48 : 58,
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1.2,
                letterSpacing: "-0.025em",
                marginBottom: 24,
                maxWidth: 920,
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 20,
                color: "rgba(255,255,255,0.45)",
                lineHeight: 1.65,
                maxWidth: 820,
              }}
            >
              {truncatedDesc}
            </div>
          </div>

          {/* Bottom bar: author / date / read time + domain */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTopWidth: 1,
              borderTopStyle: "solid",
              borderTopColor: "rgba(255,255,255,0.08)",
              paddingTop: 28,
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              {/* Author avatar placeholder */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "rgba(255,255,255,0.06)",
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: "rgba(255,255,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <span
                  style={{ fontSize: 16, color: "rgba(255,255,255,0.3)" }}
                >
                  ◎
                </span>
              </div>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.55)",
                  marginRight: 18,
                }}
              >
                ChainVolio Team
              </span>
              {date && (
                <>
                  <span
                    style={{
                      fontSize: 15,
                      color: "rgba(255,255,255,0.2)",
                      marginRight: 18,
                    }}
                  >
                    ·
                  </span>
                  <span
                    style={{
                      fontSize: 15,
                      color: "rgba(255,255,255,0.4)",
                      marginRight: 18,
                    }}
                  >
                    {date}
                  </span>
                </>
              )}
              {readTime && (
                <>
                  <span
                    style={{
                      fontSize: 15,
                      color: "rgba(255,255,255,0.2)",
                      marginRight: 18,
                    }}
                  >
                    ·
                  </span>
                  <span
                    style={{ fontSize: 15, color: "rgba(255,255,255,0.4)" }}
                  >
                    {readTime}
                  </span>
                </>
              )}
            </div>
            <span
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.2)",
                fontWeight: 500,
              }}
            >
              chainvolio.xyz
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          "Cache-Control": "public, immutable, max-age=31536000",
        },
      }
    );
  } catch (e: any) {
    return new Response(`Error: ${e.message}`, { status: 500 });
  }
}
