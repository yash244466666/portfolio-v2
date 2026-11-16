import type { MetadataRoute } from "next"
import { absoluteUrl } from "@/lib/seo"
import { projectPages, projectPagePath } from "@/lib/content/project-pages"
import { toolPages } from "@/lib/content/tool-pages"

// Metadata routes are evaluated at build time for the static export.
export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl("/"),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: absoluteUrl("/tools/"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...toolPages.map((page) => ({
      url: absoluteUrl(`/tools/${page.slug}/`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    {
      url: absoluteUrl("/projects/yashcodes/"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ]
}
