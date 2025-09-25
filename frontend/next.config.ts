import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove standalone output for simpler deployment
  outputFileTracingRoot: undefined,
};

export default nextConfig;
