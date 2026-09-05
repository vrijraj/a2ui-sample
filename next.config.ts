import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure A2UI ESM packages are compiled for the Next.js bundler.
  transpilePackages: ["@a2ui/react", "@a2ui/web_core", "@a2ui/markdown-it"],
};

export default nextConfig;
