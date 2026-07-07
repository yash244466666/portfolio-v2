"use client"

import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react"
import { getToolCategories } from "@/lib/content/tools/utils"
import type { ToolDefinition } from "@/lib/content/tools/types"
import { SearchX } from "lucide-react"
import ToolCard from "@/components/tools/tool-card"
import ToolsSections, { ToolsSectionsHandle } from "@/components/tools/tools-sections"
import ToolsToolbar from "@/components/tools/tools-toolbar"

export interface ToolsGridHandle {
  scrollToCategory: (id: string) => void
  setActiveCategory: (id: string | null) => void
}

interface ToolsGridProps {
  tools: ToolDefinition[]
  searchQuery: string
  onSearchChange: (query: string) => void
  searchPlaceholder: string
  onSelectTool: (id: string) => void
}

const POPULAR_SUGGESTIONS = ["json", "base64", "markdown", "regex", "uuid", "password"]

const ToolsGrid = forwardRef<ToolsGridHandle, ToolsGridProps>(function ToolsGrid(
  { tools, searchQuery, onSearchChange, searchPlaceholder, onSelectTool },
  ref
) {
  const categories = getToolCategories()
  const sectionsRef = useRef<ToolsSectionsHandle>(null)
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)

  useImperativeHandle(
    ref,
    () => ({
      scrollToCategory: (id: string) => {
        sectionsRef.current?.scrollToCategory(id)
      },
      setActiveCategory: (id: string | null) => {
        setActiveCategoryId(id)
      },
    }),
    []
  )

  const showSections = !searchQuery

  const matchedCategoryIds = useMemo(() => {
    if (!searchQuery) return null
    return new Set(tools.map((tool) => tool.category))
  }, [searchQuery, tools])

  const groupedResults = useMemo(() => {
    if (!searchQuery) return []
    const byCategory = new Map<string, ToolDefinition[]>()
    for (const tool of tools) {
      const list = byCategory.get(tool.category) ?? []
      list.push(tool)
      byCategory.set(tool.category, list)
    }
    return categories
      .filter((cat) => byCategory.has(cat.id))
      .map((cat) => ({ category: cat, items: byCategory.get(cat.id)! }))
  }, [searchQuery, tools, categories])

  const handleCategoryClick = useCallback(
    (id: string) => {
      if (searchQuery) {
        onSearchChange("")
        requestAnimationFrame(() => sectionsRef.current?.scrollToCategory(id))
      } else {
        sectionsRef.current?.scrollToCategory(id)
      }
    },
    [searchQuery, onSearchChange]
  )

  return (
    <section className="tools-grid tools-grid--root max-w-6xl mx-auto px-4 sm:px-6 animate-fade-in-up">
      <ToolsToolbar
        categories={categories}
        activeCategoryId={activeCategoryId}
        matchedCategoryIds={matchedCategoryIds}
        onCategoryClick={handleCategoryClick}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
      />

      {showSections ? (
        <ToolsSections
          ref={sectionsRef}
          categories={categories}
          onSelect={onSelectTool}
          onActiveCategoryChange={setActiveCategoryId}
        />
      ) : (
        <div className="tools-grid__results">
          <div className="tools-grid__results-header mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div className="tools-grid__results-meta">
              <h2 className="tools-grid__results-title text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
                Search results
              </h2>
              <p className="tools-grid__results-count text-muted-foreground mt-1" aria-live="polite">
                {tools.length} {tools.length === 1 ? "tool" : "tools"} matching &quot;{searchQuery}&quot;
              </p>
            </div>
            {tools.length > 0 && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="tools-grid__clear inline-flex min-h-[44px] items-center self-start sm:self-auto justify-center px-4 py-2 rounded-full bg-muted text-foreground text-sm font-medium border border-border/60 transition-colors hover:bg-muted/80 hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95"
              >
                Clear search
              </button>
            )}
          </div>
          {tools.length === 0 ? (
            <div className="tools-grid__empty rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-10 sm:p-12 text-center">
              <div className="tools-grid__empty-icon inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted/80 mb-4">
                <SearchX className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
              </div>
              <h3 className="tools-grid__empty-title text-lg font-medium text-foreground mb-2">No tools found</h3>
              <p className="tools-grid__empty-description text-muted-foreground mb-6 max-w-md mx-auto">
                We couldn&apos;t find any tools matching &quot;{searchQuery}&quot;. Try a different keyword or browse the suggestions below.
              </p>
              <div className="tools-grid__empty-suggestions flex flex-wrap items-center justify-center gap-2 mb-6">
                {POPULAR_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onSearchChange(s)}
                    className="tools-grid__empty-suggestion px-3 py-1.5 rounded-full text-sm bg-muted/70 text-foreground/80 border border-border/60 hover:bg-muted hover:border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="tools-grid__empty-clear inline-flex min-h-[44px] items-center justify-center px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="tools-grid__grouped-results space-y-10">
              {groupedResults.map(({ category, items }, groupIndex) => (
                <section
                  key={category.id}
                  className="tools-grid__group animate-slide-in-left motion-reduce:animate-none"
                  style={{ animationDelay: `${groupIndex * 100}ms` }}
                  aria-labelledby={`search-group-${category.id}`}
                >
                  <header className="tools-grid__group-header flex items-baseline justify-between gap-4 mb-4">
                    <h3
                      id={`search-group-${category.id}`}
                      className="tools-grid__group-title text-xl sm:text-2xl font-semibold text-foreground"
                    >
                      {category.label}
                    </h3>
                    <span className="tools-grid__group-count text-sm text-muted-foreground tabular-nums">
                      {items.length} {items.length === 1 ? "tool" : "tools"}
                    </span>
                  </header>
                  <div className="tools-grid__grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {items.map((tool, toolIndex) => (
                      <div
                        key={tool.id}
                        className="animate-fade-in-up motion-reduce:animate-none"
                        style={{ animationDelay: `${Math.min(toolIndex * 50, 400)}ms` }}
                      >
                        <ToolCard tool={tool} onSelect={onSelectTool} />
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
})

export default ToolsGrid