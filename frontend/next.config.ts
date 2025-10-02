import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  trailingSlash: false,
  // Pin tracing root to this app's directory to avoid monorepo lockfile detection issues
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
