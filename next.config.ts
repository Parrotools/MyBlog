import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // self-contained build for Docker deployment (plain `next start` otherwise)
  output: process.env.BUILD_STANDALONE ? "standalone" : undefined,
  experimental: {
    // enables the forbidden()/unauthorized() APIs and app/forbidden.tsx (403)
    authInterrupts: true,
  },
};

export default nextConfig;
