import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    serverActions: {
      // Default 1MB is far too small for the video/audio uploads that go
      // through the uploadMedia Server Action (blog media blocks, course
      // module lesson videos) — see next.config docs for bodySizeLimit.
      bodySizeLimit: "50mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
