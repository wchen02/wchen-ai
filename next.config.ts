import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  async redirects() {
    return [{ source: "/rss.xml", destination: "/rss/en.xml", permanent: true }];
  },
};

export default nextConfig;
