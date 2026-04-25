"use client"

import { useState } from "react"
import { getToolCategories, getToolsByCategory } from "@/lib/content/tools/utils"
import type { ToolDefinition } from "@/lib/content/tools/types"
import ToolCard from "@/components/tools/tool-card"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"

interface ToolsGridProps {
  tools: ToolDefinition[]
  searchQuery: string
  onSearchChange: (query: string) => void
  searchPlaceholder: string
  heading: string
  description: string
  onSelectTool: (id: string) => void
}

export default function ToolsGrid({
  tools,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  heading,
  description,
  onSelectTool,
}: ToolsGridProps) {
  const categories = getToolCategories()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filteredTools = activeCategory
    ? tools.filter((t) => t.category === activeCategory)
    : tools

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 animate-fade-in-up">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
          {heading}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {description}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10 bg-background/50 backdrop-blur-sm border-border"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="!absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors outline-none"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap justify-center">
          <button
            onClick={() => setActiveCategory(null)}
            aria-pressed={activeCategory === null}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              activeCategory === null
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              aria-pressed={activeCategory === cat.id}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {activeCategory && !searchQuery ? (
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            {categories.find((c) => c.id === activeCategory)?.label}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool, index) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onSelect={onSelectTool}
                animationDelay={index * 100}
              />
            ))}
          </div>
        </div>
      ) : (
        <div>
          {searchQuery ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool, index) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  onSelect={onSelectTool}
                  animationDelay={index * 100}
                />
              ))}
              {filteredTools.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground py-12">
                  No tools found matching &quot;{searchQuery}&quot;
                </p>
              )}
            </div>
          ) : (
            categories.map((cat) => {
              const catTools = getToolsByCategory(cat.id)
              return (
                <div key={cat.id} className="mb-12 last:mb-0">
                  <h2 className="text-2xl font-semibold text-foreground mb-2">
                    {cat.label}
                  </h2>
                  <p className="text-muted-foreground mb-6">{cat.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {catTools.map((tool, index) => (
                      <ToolCard
                        key={tool.id}
                        tool={tool}
                        onSelect={onSelectTool}
                        animationDelay={index * 100}
                      />
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </section>
  )
}