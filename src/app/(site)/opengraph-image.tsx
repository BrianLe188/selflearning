import { ImageResponse } from "next/og";
import { siteConfig } from "@/site.config";

export const alt = `${siteConfig.authorName} — ${siteConfig.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Default share image for every public route that doesn't define its own
 * (e.g. /posts/[slug] overrides this with a per-post title card).
 */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 28, color: "#a3a3a3", marginBottom: 24 }}>
          {siteConfig.authorName}
        </div>
        <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.15 }}>
          {siteConfig.name}
        </div>
        <div
          style={{
            fontSize: 30,
            color: "#a3a3a3",
            marginTop: 28,
            maxWidth: 900,
          }}
        >
          {siteConfig.description}
        </div>
      </div>
    ),
    { ...size }
  );
}
