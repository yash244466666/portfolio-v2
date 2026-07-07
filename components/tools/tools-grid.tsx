"use client"

import { getToolCategories } from "@/lib/content/tools/utils"
import type { ToolDefinition } from "@/lib/content/tools/types"
import { SearchX, ArrowLeft } from "lucide-react"
import ToolCard from "@/components/tools/tool-card"
import ToolsSections from "@/components/tools/tools-sections"

interface ToolsGridProps {
  tools: ToolDefinition[]
  searchQuery: string
  onSearchChange: (query: string) => void
  searchPlaceholder: string
  onSelectTool: (id: string) => void
}

const POPULAR_SUGGESTIONS = ["json", "base64", "markdown", "regex", "uuid", "password"]

export default function ToolsGrid({
  tools,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  onSelectTool,
}: ToolsGridProps) {
  const categories = getToolCategories()

  // The cinematic pinned-sections view is shown by default. Searching falls
  // back to a normal flat grid so results stay a simple list.
  const showSections = !searchQuery

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 animate-fade-in-up">
      {showSections ? (
        <ToolsSections
          categories={categories}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
          onSelect={onSelectTool}
        />
      ) : (
        <div>
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
                Back to all tools
              </button>
              <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
                Search results
              </h2>
              <p className="text-muted-foreground mt-1" aria-live="polite">
                {tools.length} {tools.length === 1 ? "tool" : "tools"} matching &quot;{searchQuery}&quot;
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="inline-flex min-h-[44px] items-center self-start sm:self-auto justify-center px-4 py-2 rounded-full bg-muted text-foreground text-sm font-medium border border-border/60 transition-colors hover:bg-muted/80 hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95"
            >
              Clear search
            </button>
          </div>
          {tools.length === 0 ? (
            <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-10 sm:p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted/80 mb-4">
                <SearchX className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No tools found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                We couldn&apos;t find any tools matching &quot;{searchQuery}&quot;. Try a different keyword or browse the suggestions below.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                {POPULAR_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onSearchChange(s)}
                    className="px-3 py-1.5 rounded-full text-sm bg-muted/70 text-foreground/80 border border-border/60 hover:bg-muted hover:border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="inline-flex min-h-[44px] items-center justify-center px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {tools.map((tool, index) => (
                <div
                  key={tool.id}
                  className="animate-fade-in-up motion-reduce:opacity-100 motion-reduce:[animation:none]"
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
                >
                  <ToolCard tool={tool} onSelect={onSelectTool} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
