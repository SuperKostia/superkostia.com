import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      // /voyages est devenu un hobby (décision #011).
      { source: "/voyages", destination: "/hobbies/voyages", permanent: true },
      // Projet BooKeeper retiré du site le 25/11/2026.
      { source: "/projets/bookeeper", destination: "/projets", permanent: true },
      { source: "/en/projects/bookeeper", destination: "/en/projects", permanent: true },
    ];
  },
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

const withMDX = createMDX();

export default withMDX(nextConfig);
