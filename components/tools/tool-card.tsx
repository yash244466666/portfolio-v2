"use client"

import { useSectionVisibility } from "@/hooks/use-section-visibility"
import type { ToolDefinition } from "@/lib/content/tools/types"
import { Card } from "@/components/ui/card"
import { ArrowRight, Braces } from "lucide-react"
import { iconMap } from "@/lib/content/tools/icon-map"
import { getToolCategories } from "@/lib/content/tools/utils"

interface ToolCardProps {
  tool: ToolDefinition
  onSelect: (id: string) => void
  animationDelay?: number
}

export default function ToolCard({ tool, onSelect, animationDelay = 0 }: ToolCardProps) {
  const { sectionRef, isVisible } = useSectionVisibility({ once: true, threshold: 0.1 })
  const IconComponent = iconMap[tool.icon] || Braces

  const categoryColors: Record<string, string> = {
    core: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    dev: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    text: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    media: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    security: "bg-red-500/10 text-red-400 border-red-500/20",
    math: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  }

  const categories = getToolCategories()
  const categoryLabel = categories.find((c) => c.id === tool.category)?.label || "Dev"

  return (
    <Card
      ref={sectionRef as React.Ref<HTMLDivElement>}
      role="button"
      tabIndex={0}
      aria-label={`Open ${tool.label} tool`}
      className={`group cursor-pointer p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 backdrop-blur-sm bg-background/80 border-border/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
      style={{ animationDelay: `${animationDelay}ms` }}
      onClick={() => onSelect(tool.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect(tool.id)
        }
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
          <IconComponent className="h-5 w-5" />
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${categoryColors[tool.category] || categoryColors.dev}`}>
          {categoryLabel}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
        {tool.label}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {tool.description}
      </p>
      <div className="flex items-center text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
        Open tool <ArrowRight className="ml-1 h-3.5 w-3.5" />
      </div>
    </Card>
  )
}