"use client"

import {
  ChevronRight, Home, Check, Camera, Loader2, RotateCcw, Braces
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import type { ToolDefinition } from "@/lib/content/tools/types"
import { getToolCategories } from "@/lib/content/tools/utils"
import { iconMap } from "@/lib/content/tools/icon-map"

interface ToolHeaderProps {
  tool: ToolDefinition
  onBack: () => void
  onHomeClick?: () => void
  onCategoryClick?: (categoryId: string) => void
  onReset?: () => void
}

export default function ToolHeader({ tool, onBack, onHomeClick, onCategoryClick, onReset }: ToolHeaderProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const backButtonRef = useRef<HTMLButtonElement>(null)
  const IconComponent = iconMap[tool.icon] || Braces
  const categories = getToolCategories()
  const categoryLabel = categories.find((c) => c.id === tool.category)?.label || tool.category

  // Move focus to the back button when a tool opens so keyboard users keep
  // their place and can press Enter/Space to return immediately.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      backButtonRef.current?.focus()
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  const getPageBackgroundColor = (): string => {
    const main = document.querySelector("main")
    if (!main) return "#030712"
    const computed = window.getComputedStyle(main).backgroundColor
    if (!computed || computed === "rgba(0, 0, 0, 0)" || computed === "transparent") return "#030712"
    return computed
  }

  const rgbToHex = (rgb: string): string => {
    const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/)
    if (!match) return rgb
    const toHex = (n: number) => n.toString(16).padStart(2, "0")
    return `#${toHex(Number(match[1]))}${toHex(Number(match[2]))}${toHex(Number(match[3]))}`
  }

  const captureScreenshot = async () => {
    try {
      setIsCapturing(true)
      const element = document.getElementById("tool-capture-area")
      if (!element) return

      // Use html-to-image to bypass html2canvas CSS parsing bugs (like oklch support)
      const htmlToImage = await import("html-to-image")

      const image = await htmlToImage.toPng(element, {
        backgroundColor: rgbToHex(getPageBackgroundColor()),
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
    <div className="tool-header tool-header--root animate-fade-in-up border-b border-border/30 pb-6">
      {/* Breadcrumb Navigation */}
      <nav className="tool-header__breadcrumb flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <button
          ref={backButtonRef}
          onClick={onHomeClick || onBack}
          data-tool-back-button
          className="tool-header__back flex items-center gap-1.5 hover:text-foreground transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
        >
          <Home className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
          Tools
        </button>
        <ChevronRight className="h-4 w-4 opacity-50" />
        {onCategoryClick ? (
          <button
            type="button"
            onClick={() => onCategoryClick(tool.category)}
            className="tool-header__breadcrumb-category opacity-75 hover:text-foreground hover:opacity-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
          >
            {categoryLabel}
          </button>
        ) : (
          <span className="tool-header__breadcrumb-category opacity-75">{categoryLabel}</span>
        )}
        <ChevronRight className="h-4 w-4 opacity-50" />
        <span className="tool-header__breadcrumb-current text-foreground font-medium truncate max-w-[150px] sm:max-w-xs">{tool.label}</span>
      </nav>

      {/* Header Content */}
      <div className="tool-header__content flex flex-col sm:flex-row sm:items-start justify-between gap-6">
        <div className="tool-header__content-left flex items-start gap-5">
          {/* Glowing Icon Box */}
          <div className="tool-header__icon-wrap relative group shrink-0 hidden sm:block">
            <div className="tool-header__icon-glow absolute inset-0 bg-primary/20 blur-xl rounded-2xl group-hover:bg-primary/30 transition-colors duration-500" />
            <div className="tool-header__icon relative p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-primary">
              <IconComponent className="h-8 w-8" />
            </div>
          </div>

          {/* Title and Description */}
          <div className="tool-header__meta">
            <div className="tool-header__title-row flex flex-wrap items-center gap-3 mb-2">
              <div className="tool-header__icon-mobile relative group shrink-0 sm:hidden">
                <div className="relative p-2 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-primary">
                  <IconComponent className="h-5 w-5" />
                </div>
              </div>
              <h1 className="tool-header__title text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                {tool.label}
              </h1>
              <span className="tool-header__category-badge px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider hidden sm:inline-block">
                {categoryLabel}
              </span>
            </div>

            <p className="tool-header__description text-muted-foreground text-base sm:text-lg max-w-2xl leading-relaxed mb-4">
              {tool.description}
            </p>

            {/* Tags */}
            <div className="tool-header__tags flex flex-wrap gap-2">
              {tool.tags.map((tag) => (
                <span
                  key={tag}
                  className="tool-header__tag px-2.5 py-1 rounded-md text-xs font-medium bg-muted/50 text-muted-foreground border border-border/50"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="tool-header__actions flex items-center gap-2">
          {onReset && (
            <button
              onClick={onReset}
              className="tool-header__reset shrink-0 flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-background border border-border/50 text-sm font-medium text-foreground hover:bg-muted/50 hover:border-border hover:text-destructive transition-all active:scale-95"
              aria-label="Reset tool state"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          <button
            onClick={captureScreenshot}
            disabled={isCapturing}
            className="tool-header__capture shrink-0 flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-background border border-border/50 text-sm font-medium text-foreground hover:bg-muted/50 hover:border-border transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
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