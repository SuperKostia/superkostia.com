import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    // /voyages est devenu un hobby (décision #011).
    return [{ source: "/voyages", destination: "/hobbies/voyages", permanent: true }];
  },
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

const withMDX = createMDX();

export default withMDX(nextConfig);
