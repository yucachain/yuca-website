import type { NextConfig } from "next";

// BACKEND_ORIGIN is a server-only env var (no NEXT_PUBLIC_ prefix).
// It is never sent to the browser — only used here in next.config.ts
// to forward /backend-api/* requests server-side, eliminating CORS entirely.
const BACKEND_ORIGIN = (
  process.env.BACKEND_ORIGIN ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://api.yucachain.com"
)
  // Strip trailing slash and /index.html variants so path joining is clean
  .replace(/\/index\.html?$/i, "")
  .replace(/\/$/, "")
  // If someone accidentally set this to the proxy path itself, fall back gracefully
  .replace(/^\/backend-api.*/, "https://api.yucachain.com");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Browser → GET /backend-api/api/v1/...
        // Next.js server → GET https://your-tunnel.com/api/v1/...  (no CORS preflight)
        source: "/backend-api/:path*",
        destination: `${BACKEND_ORIGIN}/:path*`,
      },
    ];
  },
};

export default nextConfig;
