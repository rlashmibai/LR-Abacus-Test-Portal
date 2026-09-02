import type { NextConfig } from "next";

// Everything the site loads (fonts, images, scripts, styles) is served
// from its own origin - next/font self-hosts Google Fonts at build time,
// there are no third-party trackers, and all API calls are same-origin,
// so the CSP below stays tight - connect-src has exactly one exception,
// formsubmit.co, since the contact form's fetch() goes straight there
// (see src/components/ContactForm.tsx). Without this the browser
// silently blocks the request client-side - curl/server-side testing
// won't catch it, since CSP is enforced only in the browser.
// React's dev-mode debugging tools (component stack reconstruction) use
// eval() and are only ever active in development - never in a production
// build - so only relax the CSP for it locally, not on the deployed site.
const isDev = process.env.NODE_ENV !== "production";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self'",
      "connect-src 'self' https://formsubmit.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
