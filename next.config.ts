import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Clerk FAPI hostname — derived from publishable key prefix.
// Session token sync calls go here even when the middleware proxy is active.
const CLERK_FAPI = "decent-tick-22.clerk.accounts.dev";

const csp = [
  "default-src 'self'",
  // Next.js App Router inlines bootstrap scripts; unsafe-eval kept to dev only (webpack HMR).
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  // Tailwind v4 and Framer Motion apply inline styles at runtime.
  "style-src 'self' 'unsafe-inline'",
  // next/font/google self-hosts fonts at build time — no external font origin required.
  "font-src 'self' data:",
  // Sanity CDN + Unsplash + Clerk avatars + Cloudinary (mirrors next.config images.remotePatterns).
  "img-src 'self' data: blob: https://cdn.sanity.io https://images.unsplash.com https://img.clerk.com https://*.cloudinary.com",
  // Browser-initiated connections:
  //   'self'           → /api/chat, /api/chat-token (Gemini/Groq/Upstash are server-side only)
  //   *.sanity.io      → sanityFetch CDN queries
  //   *.api.sanity.io  → Sanity Live content API (SSE EventSource)
  //   CLERK_FAPI       → Clerk session token sync
  `connect-src 'self' https://*.sanity.io https://*.api.sanity.io https://${CLERK_FAPI}`,
  // Clerk sign-in Cloudflare Turnstile challenge renders in an iframe.
  "frame-src https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // REPORT-ONLY: logs violations to console without blocking any resource.
  // Switch key to "Content-Security-Policy" after confirming zero violations
  // across all sections (Three.js, Sanity images, Orby /api/chat, Clerk auth).
  { key: "Content-Security-Policy-Report-Only", value: csp },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "**.cloudinary.com" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
