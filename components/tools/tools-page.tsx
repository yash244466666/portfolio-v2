"use client"

import { useEffect, useCallback, useRef, useState } from "react"
import { getToolsPageContent, searchTools } from "@/lib/content/tools/utils"
import ToolsGrid, { ToolsGridHandle } from "@/components/tools/tools-grid"
import ToolView from "@/components/tools/tool-view"

export default function ToolsPage() {
  const [activeToolId, setActiveToolId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const content = getToolsPageContent()
  const gridRef = useRef<ToolsGridHandle>(null)
  const mountedRef = useRef(false)
  const pendingCategoryRef = useRef<string | null>(null)

  // On mount, tag the current history entry with the page's initial scroll
  // position so back navigation can restore it later. Also open a tool if the
  // URL was loaded with a hash.
  useEffect(() => {
    if (mountedRef.current) return
    mountedRef.current = true

    const originalScrollRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = "manual"

    const hash = window.location.hash.slice(1)
    if (hash) {
      setActiveToolId(hash)
      window.scrollTo(0, 0)
    } else {
      // The initial tools page entry should always restore to the very top.
      window.history.replaceState({ scrollY: 0 }, "", window.location.href)
    }

    return () => {
      window.history.scrollRestoration = originalScrollRestoration
    }
  }, [])

  // Sync state with browser back/forward and restore the exact scroll position
  // stored in the history entry.
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const hash = window.location.hash.slice(1)
      const nextToolId = event.state?.toolId || hash || null
      setActiveToolId(nextToolId)

      if (!nextToolId) {
        const savedY = event.state?.scrollY
        if (typeof savedY === "number" && event.state?.isGrid) {
          requestAnimationFrame(() => {
            window.scrollTo({ top: savedY, behavior: "auto" })
            // If a category breadcrumb click queued a category scroll, apply it
            // now that the grid is visible and at the saved card position.
            const queued = pendingCategoryRef.current
            if (queued) {
              pendingCategoryRef.current = null
              requestAnimationFrame(() => {
                gridRef.current?.scrollToCategory(queued)
              })
            }
          })
        } else {
          // Initial tools page entry (or any non-grid entry) goes to the top.
          requestAnimationFrame(() => {
            window.scrollTo({ top: 0, behavior: "auto" })
            const queued = pendingCategoryRef.current
            if (queued) {
              pendingCategoryRef.current = null
              requestAnimationFrame(() => {
                gridRef.current?.scrollToCategory(queued)
              })
            }
          })
        }
      } else {
        window.scrollTo(0, 0)
      }
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  const selectTool = useCallback((id: string) => {
    const scrollY = window.scrollY

    // Create a dedicated grid entry at the exact scroll position of the clicked
    // card. The next back will land here precisely.
    window.history.pushState({ scrollY, isGrid: true }, "", window.location.href)

    // Create the tool entry on top of it.
    window.history.pushState({ toolId: id, scrollY }, "", `#${id}`)

    setActiveToolId(id)
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "auto" })
    })
  }, [])

  const goBack = useCallback(() => {
    window.history.back()
  }, [])

  const handleCategoryClick = useCallback((categoryId: string) => {
    // The popstate handler will restore the saved grid scroll position and then
    // see the queued category id and scroll to that section start. This keeps
    // category-click navigation in sync with the history back stack.
    pendingCategoryRef.current = categoryId
    window.history.back()
  }, [])

  const handleHomeClick = useCallback(() => {
    window.location.hash = ""
    window.scrollTo(0, 0)
    // The scroll handler only updates the active category when the user
    // scrolls; after jumping to the top we already know the first category
    // is active, so update the toolbar chip immediately.
    gridRef.current?.setActiveCategory(content.categories[0]?.id ?? null)
  }, [content.categories])

  const filteredTools = searchQuery ? searchTools(searchQuery) : content.tools
  const showToolView = Boolean(activeToolId)

  return (
    <div className="tools-page tools-page--root relative">
      {/**
       * The grid stays mounted while a tool is open so React state (search,
       * scroll-driven sections, measured offsets) is preserved. It is hidden
       * via display:none so the tool view renders as a normal page instead of
       * an overlay/modal. Browser back/forward restores the saved scroll
       * position explicitly through history state.
       */}
      <div className={showToolView ? "hidden" : "block"}>
        <ToolsGrid
          ref={gridRef}
          tools={filteredTools}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder={content.searchPlaceholder}
          onSelectTool={selectTool}
        />
      </div>

      {showToolView && (
        <div className="min-h-screen relative animate-fade-in">
          {/**
           * The animated background from app/tools/page.tsx sits behind this
           * wrapper (z-0 vs relative z-10). Keeping the tool view transparent
           * lets the live hex-grid animation show through, while the content
           * card uses glassmorphism for readability.
           */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background/60 pointer-events-none" />
          <ToolView
            toolId={activeToolId!}
            onBack={goBack}
            onHomeClick={handleHomeClick}
            onCategoryClick={handleCategoryClick}
            backLabel={content.backToGridLabel}
          />
        </div>
      )}
    </div>
  )
}
