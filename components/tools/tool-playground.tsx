"use client"

import { lazy, Suspense, useMemo, useState, type ComponentType, type LazyExoticComponent } from "react"
import { useRouter } from "next/navigation"
import { Wrench } from "lucide-react"
import { getToolById } from "@/lib/content/tools/utils"
import ToolHeader from "@/components/tools/tool-header"

const importCache = new Map<string, LazyExoticComponent<ComponentType>>()

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
    <div className="flex flex-col items-center justify-center h-full min-h-[260px] gap-4">
      <div className="w-12 h-12 rounded-2xl bg-muted/80 flex items-center justify-center text-muted-foreground">
        <Wrench className="h-6 w-6" aria-hidden="true" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-1">Tool unavailable</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          This utility is temporarily offline. Try another tool from the directory or refresh the page.
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

interface ToolPlaygroundProps {
  toolId: string
}

/**
 * The interactive widget for a standalone tool page: the same catalog widget,
 * Reset, and Capture actions used inside the tools directory. It is mounted
 * below the server-rendered answer copy.
 */
export default function ToolPlayground({ toolId }: ToolPlaygroundProps) {
  const router = useRouter()
  const tool = getToolById(toolId)
  const [resetKey, setResetKey] = useState(0)

  const ToolComponent = useMemo(() => {
    if (!tool) return null
    return loadToolComponent(tool.category, tool.id)
  }, [tool])

  if (!tool) return null

  return (
    <section
      aria-labelledby="tool-widget-heading"
      className="mx-auto mt-10 max-w-5xl px-4 sm:px-6"
    >
      <h2 id="tool-widget-heading" className="sr-only">
        Try the {tool.label}
      </h2>
      <div id="tool-capture-area" className="tool-view tool-view--root relative">
        <div className="tool-view__content py-2 sm:py-4 flex flex-col">
          <ToolHeader
            tool={tool}
            onBack={() => router.push("/tools/")}
            onReset={() => setResetKey((key) => key + 1)}
            showTitle={false}
          />
          <div
            className="tool-view__body mt-6 sm:mt-8 flex-1 animate-fade-in-up"
            style={{ animationDelay: "150ms" }}
          >
            <div className="tool-view__body-inner tool-surface-light h-full bg-background/35 backdrop-blur-xl border border-border/40 rounded-2xl p-4 sm:p-8 shadow-2xl">
              {ToolComponent ? (
                <Suspense fallback={<ToolFallback />}>
                  <ToolComponent key={resetKey} />
                </Suspense>
              ) : (
                <ToolUnavailable />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
