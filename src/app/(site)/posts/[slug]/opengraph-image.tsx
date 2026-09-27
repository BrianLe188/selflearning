import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/posts";
import { siteConfig } from "@/site.config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const title = post?.title ?? siteConfig.name;
  const tag = post?.tag;

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
        {tag && (
          <div style={{ fontSize: 28, color: "#a3a3a3", marginBottom: 24 }}>
            {tag}
          </div>
        )}
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.2 }}>
          {title}
        </div>
        <div style={{ fontSize: 26, color: "#a3a3a3", marginTop: 40 }}>
          {siteConfig.authorName} · {siteConfig.name}
        </div>
      </div>
    ),
    { ...size }
  );
}
