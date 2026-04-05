import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: [
    "@xusmo/engine",
    "@xusmo/editor",
    "@xusmo/wordpress",
    "@xusmo/publish",
  ],
};

export default nextConfig;
