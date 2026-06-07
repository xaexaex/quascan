import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/sitemap-main.xml',
        destination: '/sitemap.xml',
      },
    ];
  },
};

export default nextConfig;