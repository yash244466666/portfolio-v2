import Link from "next/link"
import { getToolsPageContent } from "@/lib/content/tools/utils"
import { toolPages } from "@/lib/content/tool-pages"

/**
 * Visible directory heading and ordinary links to the first published tool
 * pages. This is part of the grid state, so opening an in-place tool leaves a
 * single h1 (the tool's own heading) on the page.
 */
export function ToolsDirectoryHeader() {
  const content = getToolsPageContent()

  return (
    <header className="tools-directory-header px-4 pt-6 sm:px-6 sm:pt-8 pb-2">
      <div className="mx-auto max-w-6xl">
        <p className="mb-2 text-sm font-medium text-primary">YashCodes</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Free Online Developer Tools
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {content.description}
        </p>
        <nav aria-label="Featured tool pages" className="mt-5 flex flex-wrap gap-2">
          {toolPages.map((page) => (
            <Link
              key={page.slug}
              href={`/tools/${page.slug}/`}
              className="inline-flex min-h-[44px] items-center rounded-full border border-border/60 bg-muted/40 px-4 text-sm font-medium text-foreground/90 transition-colors hover:border-border hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {page.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default ToolsDirectoryHeader
