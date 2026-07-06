import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // three.js ships ESM; let Next transpile it and the R3F ecosystem cleanly.
  transpilePackages: ["three"],
};

export default nextConfig;
