"use client"

import { lazy, Suspense, useMemo, useState } from "react"
import { Wrench } from "lucide-react"
import { getToolById } from "@/lib/content/tools/utils"
import ToolHeader from "@/components/tools/tool-header"

const importCache = new Map<string, React.LazyExoticComponent<React.ComponentType>>()

function loadToolComponent(category: string, toolId: string) {
  const path = `@/components/tools/${category}/${toolId}`
  if (!importCache.has(path)) {
    importCache.set(
      path,
      lazy(() =>
        import(`@/components/tools/${category}/${toolId}`).catch(() => {
          return { default: ToolUnavailable }
        })
      )
    )
  }
  return importCache.get(path)!
}

function ToolUnavailable() {
  return (
    <div className="tool-view__unavailable flex flex-col items-center justify-center h-full min-h-[260px] gap-4">
      <div className="w-12 h-12 rounded-2xl bg-muted/80 flex items-center justify-center text-muted-foreground">
        <Wrench className="h-6 w-6" aria-hidden="true" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-1">Tool unavailable</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          This utility is temporarily offline. Pick another tool from the grid or try refreshing the page.
        </p>
      </div>
    </div>
  )
}

function ToolFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  )
}

interface ToolViewProps {
  toolId: string
  onBack: () => void
  onHomeClick?: () => void
  onCategoryClick?: (categoryId: string) => void
  backLabel: string
}

export default function ToolView({ toolId, onBack, onHomeClick, onCategoryClick, backLabel }: ToolViewProps) {
  const tool = getToolById(toolId)
  const [resetKey, setResetKey] = useState(0)

  const ToolComponent = useMemo(() => {
    if (!tool) return null
    return loadToolComponent(tool.category, tool.id)
  }, [tool])

  if (!tool) {
    return (
      <div className="tool-view tool-view--not-found-wrapper min-h-screen w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-16 flex items-center justify-center">
        <div className="tool-view__not-found max-w-4xl w-full bg-background/80 backdrop-blur-xl border border-border/50 rounded-3xl p-8 sm:p-12 shadow-2xl min-h-[400px] flex flex-col items-center justify-center text-center">
          <h2 className="tool-view__not-found-title text-2xl font-bold text-foreground mb-4">Tool Not Found</h2>
          <p className="tool-view__not-found-description text-muted-foreground mb-8">The tool you&apos;re looking for doesn&apos;t exist.</p>
          <button onClick={onBack} className="tool-view__not-found-back text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded">{backLabel}</button>
        </div>
      </div>
    )
  }

  const maxWidth = tool.wide ? "max-w-7xl" : "max-w-4xl"

  return (
    <div className="tool-view tool-view--root min-h-screen w-full relative">
      <div id="tool-capture-area" className={`tool-view__content ${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-16 flex flex-col min-h-screen relative`}>
        <ToolHeader
          tool={tool}
          onBack={onBack}
          onHomeClick={onHomeClick}
          onCategoryClick={onCategoryClick}
          onReset={() => setResetKey(k => k + 1)}
        />
        <div className="tool-view__body mt-8 flex-1 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          <div className="tool-view__body-inner h-full bg-background/70 backdrop-blur-xl border border-border/40 rounded-2xl p-6 sm:p-8 shadow-2xl">
            {ToolComponent ? (
              <Suspense fallback={<ToolFallback />}><ToolComponent key={resetKey} /></Suspense>
            ) : (
              <ToolUnavailable />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
