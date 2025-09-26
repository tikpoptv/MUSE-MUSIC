import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  trailingSlash: false,
  outputFileTracingRoot: undefined,
};

export default nextConfig;
