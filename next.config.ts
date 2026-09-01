import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  onDemandEntries: {
    // Keep compiled pages in memory for 24 hours in dev mode for sub-second feature switching
    maxInactiveAge: 24 * 60 * 60 * 1000,
    pagesBufferLength: 50,
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;


