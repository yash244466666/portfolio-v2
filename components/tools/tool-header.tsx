"use client"

import {
  ChevronRight, Home, Check, Camera, Loader2, RotateCcw, Braces
} from "lucide-react"
import { useState } from "react"
import type { ToolDefinition } from "@/lib/content/tools/types"
import { getToolCategories } from "@/lib/content/tools/utils"
import { iconMap } from "@/lib/content/tools/icon-map"

interface ToolHeaderProps {
  tool: ToolDefinition
  onBack: () => void
  onReset?: () => void
}

export default function ToolHeader({ tool, onBack, onReset }: ToolHeaderProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const IconComponent = iconMap[tool.icon] || Braces
  const categories = getToolCategories()
  const categoryLabel = categories.find((c) => c.id === tool.category)?.label || tool.category

  const captureScreenshot = async () => {
    try {
      setIsCapturing(true)
      const element = document.getElementById("tool-capture-area")
      if (!element) return

      // Use html-to-image to bypass html2canvas CSS parsing bugs (like oklch support)
      const htmlToImage = await import("html-to-image")
      
      const image = await htmlToImage.toPng(element, {
        backgroundColor: "#030712", // Fallback dark background
        pixelRatio: 2, // High quality
      })

      const link = document.createElement("a")
      link.href = image
      link.download = `${tool.id}-snapshot.png`
      link.click()

      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 2000)
    } catch (error) {
      console.error("Failed to capture screenshot:", error)
    } finally {
      setIsCapturing(false)
    }
  }

  return (
    <div className="animate-fade-in-up">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 hover:text-foreground transition-colors group"
        >
          <Home className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
          Tools
        </button>
        <ChevronRight className="h-4 w-4 opacity-50" />
        <span className="opacity-75">{categoryLabel}</span>
        <ChevronRight className="h-4 w-4 opacity-50" />
        <span className="text-foreground font-medium truncate max-w-[150px] sm:max-w-xs">{tool.label}</span>
      </nav>

      {/* Header Content */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
        <div className="flex items-start gap-5">
          {/* Glowing Icon Box */}
          <div className="relative group shrink-0 hidden sm:block">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-2xl group-hover:bg-primary/30 transition-colors duration-500" />
            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-primary">
              <IconComponent className="h-8 w-8" />
            </div>
          </div>

          {/* Title and Description */}
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <div className="relative group shrink-0 sm:hidden">
                <div className="relative p-2 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-primary">
                  <IconComponent className="h-5 w-5" />
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                {tool.label}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider hidden sm:inline-block">
                {categoryLabel}
              </span>
            </div>
            
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl leading-relaxed mb-4">
              {tool.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {tool.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-muted/50 text-muted-foreground border border-border/50"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onReset && (
            <button
              onClick={onReset}
              className="shrink-0 flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-background border border-border/50 text-sm font-medium text-foreground hover:bg-muted/50 hover:border-border hover:text-destructive transition-all active:scale-95"
              aria-label="Reset tool state"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          <button
            onClick={captureScreenshot}
            disabled={isCapturing}
            className="shrink-0 flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-background border border-border/50 text-sm font-medium text-foreground hover:bg-muted/50 hover:border-border transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            aria-label="Take screenshot"
          >
          {isCapturing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span>Capturing...</span>
            </>
          ) : isSuccess ? (
            <>
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-green-500">Saved!</span>
            </>
          ) : (
            <>
              <Camera className="h-4 w-4 text-muted-foreground" />
              <span>Capture</span>
            </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}