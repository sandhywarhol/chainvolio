import React from "react";

type BadgeColor = "amber" | "green" | "teal";

interface OgTemplateProps {
  title: string;
  description?: string;
  tagText?: string;
  tagColor?: BadgeColor;
  /** Left side of the footer row */
  footerLeft?: string;
  /** Override title font-size. Auto-sized by default based on title length. */
  titleSize?: number;
}

const BADGE_COLORS: Record<BadgeColor, { bg: string; border: string; text: string }> = {
  amber: {
    bg: "rgba(253,230,138,0.1)",
    border: "rgba(253,230,138,0.3)",
    text: "#fde68a",
  },
  green: {
    bg: "rgba(134,239,172,0.1)",
    border: "rgba(134,239,172,0.3)",
    text: "#86efac",
  },
  teal: {
    bg: "rgba(94,234,212,0.1)",
    border: "rgba(94,234,212,0.3)",
    text: "#5eead4",
  },
};

export function buildOgTemplate({
  title,
  description,
  tagText,
  tagColor = "amber",
  footerLeft,
  titleSize,
}: OgTemplateProps): React.ReactElement {
  const color = BADGE_COLORS[tagColor];
  const fontSize =
    titleSize ??
    (title.length > 70 ? 42 : title.length > 50 ? 50 : title.length > 35 ? 56 : 62);
  const truncDesc =
    description && description.length > 130
      ? description.slice(0, 127) + "..."
      : description;

  return (
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
      {/* ── Top bar ── */}
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
            <span style={{ fontSize: 22, fontWeight: 900, color: "#07070B" }}>
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

        {/* Optional badge */}
        {tagText && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 20px",
              backgroundColor: color.bg,
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: color.border,
              borderRadius: 100,
              fontSize: 12,
              fontWeight: 700,
              color: color.text,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {tagText}
          </div>
        )}
      </div>

      {/* ── Main content ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          justifyContent: "center",
          paddingTop: 32,
          paddingBottom: 32,
        }}
      >
        <div
          style={{
            fontSize,
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.2,
            letterSpacing: "-0.025em",
            marginBottom: truncDesc ? 24 : 0,
            maxWidth: 920,
          }}
        >
          {title}
        </div>

        {truncDesc && (
          <div
            style={{
              fontSize: 20,
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.65,
              maxWidth: 820,
            }}
          >
            {truncDesc}
          </div>
        )}
      </div>

      {/* ── Bottom bar ── */}
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
        <span
          style={{
            fontSize: 15,
            color: "rgba(255,255,255,0.4)",
            fontWeight: 500,
          }}
        >
          {footerLeft ?? "chainvolio.xyz"}
        </span>
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
  );
}
