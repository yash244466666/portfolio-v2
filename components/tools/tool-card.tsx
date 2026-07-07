"use client"

import type { ToolDefinition } from "@/lib/content/tools/types"
import { Card } from "@/components/ui/card"
import { ArrowRight, Braces } from "lucide-react"
import { iconMap } from "@/lib/content/tools/icon-map"
import { getToolCategories } from "@/lib/content/tools/utils"

interface ToolCardProps {
  tool: ToolDefinition
  onSelect: (id: string) => void
}

/**
 * Premium glassmorphism tool card.
 *
 * Reveal and scroll-driven motion are handled by the surrounding container, so
 * this component stays fully visible and relies on a stable `.tool-card` class
 * for any external animation targets.
 */
export default function ToolCard({ tool, onSelect }: ToolCardProps) {
  const IconComponent = iconMap[tool.icon] || Braces

  const categoryAccent: Record<string, string> = {
    core: "text-blue-300 border-blue-400/30 bg-blue-400/10",
    dev: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10",
    text: "text-amber-300 border-amber-400/30 bg-amber-400/10",
    media: "text-purple-300 border-purple-400/30 bg-purple-400/10",
    security: "text-red-300 border-red-400/30 bg-red-400/10",
    math: "text-cyan-300 border-cyan-400/30 bg-cyan-400/10",
  }

  const categories = getToolCategories()
  const categoryLabel = categories.find((c) => c.id === tool.category)?.label || "Dev"

  return (
    <a
      href={`#${tool.id}`}
      data-tool-card={tool.id}
      aria-label={`Open ${tool.label} tool`}
      className="tool-card tool-card--root group relative cursor-pointer overflow-hidden p-4 sm:p-5 h-full flex flex-col gap-3 sm:gap-4 rounded-xl
        bg-muted/70 backdrop-blur-md border border-white/[0.08]
        transition-all duration-200 ease-out
        hover:-translate-y-1
        active:scale-[0.98] active:duration-75
        touch-manipulation
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      onClick={(e) => {
        if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return
        e.preventDefault()
        onSelect(tool.id)
      }}
    >
      <div className="tool-card__top flex items-start justify-between gap-3">
        <div className="tool-card__icon-tile p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary border border-primary/10 transition-all duration-200">
          <IconComponent className="h-6 w-6" aria-hidden="true" />
        </div>
        <span
          className={`tool-card__category-badge text-xs px-2.5 py-1 rounded-full border font-medium backdrop-blur-sm whitespace-nowrap ${categoryAccent[tool.category] || categoryAccent.dev}`}
        >
          {categoryLabel}
        </span>
      </div>

      <div className="tool-card__body flex-1 flex flex-col min-h-0">
        <h3 className="tool-card__title text-base sm:text-lg font-semibold text-foreground mb-1.5 leading-tight">
          {tool.label}
        </h3>
        <p className="tool-card__description text-sm text-muted-foreground/90 line-clamp-2 sm:line-clamp-3 leading-relaxed">
          {tool.description}
        </p>
      </div>

      <div className="tool-card__footer flex items-center justify-between text-sm font-medium text-primary pt-2 border-t border-white/[0.06]">
        <span className="tool-card__footer-label">Open tool</span>
        <ArrowRight
          className="tool-card__footer-arrow h-4 w-4"
          aria-hidden="true"
        />
      </div>
    </a>
  )
}
