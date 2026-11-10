import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo"

// Metadata routes are evaluated at build time for the static export.
export const dynamic = "force-static"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        // ChatGPT Search uses OAI-SearchBot; it is allowed to read the public
        // pages that are eligible for search snippets.
        userAgent: "OAI-SearchBot",
        allow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
