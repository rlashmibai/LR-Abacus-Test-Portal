import type { MetadataRoute } from "next";

const BASE_URL = "https://abacus-test-portal-lr.netlify.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Everything behind a login (per-student dashboard, live tests,
      // results, achievements...) plus API routes - nothing useful for a
      // search engine to index, and it's all session-gated anyway.
      disallow: [
        "/dashboard",
        "/test-setup",
        "/instructions",
        "/test/",
        "/results",
        "/achievements",
        "/certificate",
        "/progress",
        "/profile",
        "/api/",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
