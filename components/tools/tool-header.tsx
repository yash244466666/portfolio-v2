"use client"

import {
  ChevronRight, Home, Check, Camera, Loader2, RotateCcw, Braces, TriangleAlert
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
  const [isError, setIsError] = useState(false)
  const backButtonRef = useRef<HTMLButtonElement>(null)
  const feedbackTimerRef = useRef<number | null>(null)
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

  // Clear the "Saved!" / "Capture failed" timer if the tool closes first.
  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current !== null) {
        window.clearTimeout(feedbackTimerRef.current)
      }
    }
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

  const showFeedback = (state: "success" | "error") => {
    setIsSuccess(state === "success")
    setIsError(state === "error")
    if (feedbackTimerRef.current !== null) {
      window.clearTimeout(feedbackTimerRef.current)
    }
    feedbackTimerRef.current = window.setTimeout(() => {
      setIsSuccess(false)
      setIsError(false)
      feedbackTimerRef.current = null
    }, state === "error" ? 3000 : 2000)
  }

  const captureScreenshot = async () => {
    const element = document.getElementById("tool-capture-area")
    if (!element) return

    setIsCapturing(true)
    setIsSuccess(false)
    setIsError(false)

    // Hide the transient spinner / "Saved!" state from the snapshot without
    // reflowing the header: visibility keeps the action row's space.
    // html-to-image reads each node's computed style separately, and the
    // buttons transition `visibility` through `transition-all`, so the
    // computed value would still be "visible" when the clone is taken. Hide
    // every node in the action row and cancel its transition first.
    const actions = element.querySelector<HTMLElement>(".tool-header__actions")
    const actionNodes = actions
      ? [actions, ...Array.from(actions.querySelectorAll<HTMLElement>("*"))]
      : []
    const previousStyles = actionNodes.map((node) => ({
      visibility: node.style.visibility,
      transition: node.style.transition,
    }))
    for (const node of actionNodes) {
      node.style.transition = "none"
      node.style.visibility = "hidden"
    }

    try {
      // Use html-to-image to bypass html2canvas CSS parsing bugs (like oklch support)
      const htmlToImage = await import("html-to-image")

      const image = await htmlToImage.toPng(element, {
        backgroundColor: rgbToHex(getPageBackgroundColor()),
        pixelRatio: 2, // High quality
        width: element.offsetWidth,
        height: element.offsetHeight,
        // html-to-image clones the node with its computed styles, so a centered
        // container re-centers inside the capture surface: the left offset shows
        // up as blank space and the right edge gets clipped.
        style: { margin: "0", maxWidth: "none" },
      })

      const link = document.createElement("a")
      link.href = image
      link.download = `${tool.id}-snapshot.png`
      // Attach the link so the click is honoured in every browser.
      document.body.appendChild(link)
      link.click()
      link.remove()

      showFeedback("success")
    } catch (error) {
      console.error("Failed to capture screenshot:", error)
      showFeedback("error")
    } finally {
      actionNodes.forEach((node, index) => {
        node.style.visibility = previousStyles[index].visibility
        node.style.transition = previousStyles[index].transition
      })
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
            <div className="tool-header__title-row flex flex-wrap items-center gap-x-3 gap-y-2 mb-2">
              <div className="tool-header__icon-mobile relative group shrink-0 sm:hidden">
                <div className="relative p-2 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-primary">
                  <IconComponent className="h-5 w-5" />
                </div>
              </div>
              <h1 className="tool-header__title text-2xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 min-w-0">
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
            <div className="tool-header__tags tool-surface-light flex flex-wrap gap-2">
              {tool.tags.map((tag) => (
                <span
                  key={tag}
                  className="tool-header__tag px-2.5 py-1 rounded-md text-xs font-medium bg-background/50 backdrop-blur-sm text-muted-foreground border border-border/50"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="tool-header__actions tool-surface-light flex items-center gap-2 self-end sm:self-auto">
          {onReset && (
            <button
              onClick={onReset}
              className="tool-header__reset shrink-0 flex items-center justify-center gap-2 h-10 w-10 sm:w-auto sm:px-4 rounded-xl bg-background/35 backdrop-blur-xl border border-border/50 text-sm font-medium text-foreground hover:bg-muted/50 hover:border-border hover:text-destructive transition-all active:scale-95"
              aria-label="Reset tool state"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          <button
            onClick={captureScreenshot}
            disabled={isCapturing}
            className={`tool-header__capture shrink-0 flex items-center justify-center gap-2 h-10 px-3 sm:px-4 rounded-xl backdrop-blur-xl border border-border/50 text-sm font-medium text-foreground hover:border-border transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${isSuccess || isError ? "bg-background/80 hover:bg-background/80" : "bg-background/35 hover:bg-muted/50"}`}
            aria-label={
              isCapturing
                ? "Capturing screenshot"
                : isError
                  ? "Screenshot capture failed"
                  : "Take screenshot"
            }
          >
          {isCapturing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="hidden sm:inline">Capturing...</span>
            </>
          ) : isError ? (
            <>
              <TriangleAlert className="h-4 w-4 text-destructive" />
              <span className="hidden sm:inline text-destructive">Capture failed</span>
            </>
          ) : isSuccess ? (
            <>
              <Check className="h-4 w-4 text-green-900" />
              <span className="hidden sm:inline text-green-900">Saved!</span>
            </>
          ) : (
            <>
              <Camera className="h-4 w-4 text-muted-foreground" />
              <span className="hidden sm:inline">Capture</span>
            </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}