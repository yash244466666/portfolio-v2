import type { MetadataRoute } from "next"
import { absoluteUrl } from "@/lib/seo"
import { toolPages } from "@/lib/content/tool-pages"

// Metadata routes are evaluated at build time for the static export.
export const dynamic = "force-static"

// The content release date for this version of the site.
const LAST_MODIFIED = new Date("2026-11-12T00:00:00.000Z")

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl("/"),
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: absoluteUrl("/tools/"),
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...toolPages.map((page) => ({
      url: absoluteUrl(`/tools/${page.slug}/`),
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    {
      url: absoluteUrl("/projects/yashcodes/"),
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ]
}
