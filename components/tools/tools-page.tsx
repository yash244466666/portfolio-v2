"use client"

import { useEffect, useCallback, useRef } from "react"
import { useState } from "react"
import { getToolsPageContent, searchTools } from "@/lib/content/tools/utils"
import ToolsGrid from "@/components/tools/tools-grid"
import ToolView from "@/components/tools/tool-view"

export default function ToolsPage() {
  const [activeToolId, setActiveToolId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const content = getToolsPageContent()
  const lastFocusedRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash) {
      setActiveToolId(hash)
    }

    const handleHashChange = () => {
      const hash = window.location.hash.slice(1)
      setActiveToolId(hash || null)
    }

    window.addEventListener("hashchange", handleHashChange)
    return () => {
      window.removeEventListener("hashchange", handleHashChange)
    }
  }, [])

  // Focus management: when a tool opens, move focus to the tool's back
  // button; when returning to the grid, restore focus to the card that
  // initiated the navigation.
  useEffect(() => {
    if (activeToolId) {
      const t = window.setTimeout(() => {
        const btn = document.querySelector<HTMLButtonElement>("[data-tool-back-button]")
        btn?.focus()
      }, 60)
      return () => window.clearTimeout(t)
    }
    if (lastFocusedRef.current) {
      lastFocusedRef.current.focus()
      lastFocusedRef.current = null
    }
  }, [activeToolId])

  const selectTool = useCallback((id: string) => {
    const active = document.activeElement as HTMLElement | null
    if (active && typeof active.focus === "function") {
      lastFocusedRef.current = active
    }
    setActiveToolId(id)
    window.history.replaceState(null, "", `#${id}`)
    window.scrollTo(0, 0)
  }, [])

  const goBack = useCallback(() => {
    setActiveToolId(null)
    window.history.replaceState(null, "", window.location.pathname)
  }, [])

  const filteredTools = searchQuery
    ? searchTools(searchQuery)
    : content.tools

  if (activeToolId) {
    return (
      <div className="tools-page tools-page--tool-view">
        <ToolView
          toolId={activeToolId}
          onBack={goBack}
          backLabel={content.backToGridLabel}
        />
      </div>
    )
  }

  return (
    <div className="tools-page tools-page--grid">
      <h1 className="tools-page__heading sr-only">{content.heading}</h1>
      <ToolsGrid
        tools={filteredTools}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={content.searchPlaceholder}
        onSelectTool={selectTool}
      />
    </div>
  )
}