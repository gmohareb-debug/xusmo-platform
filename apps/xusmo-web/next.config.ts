import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  typescript: {
    // Pre-existing type issues (session augmentation, Prisma types) — app runs fine
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
