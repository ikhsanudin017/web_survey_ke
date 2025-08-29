import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure server can load CommonJS packages like pdf-parse without bundling issues
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
