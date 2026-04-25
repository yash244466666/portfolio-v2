"use client"

import { useState, useEffect, useCallback } from "react"
import { getToolsPageContent, searchTools } from "@/lib/content/tools/utils"
import type { ToolDefinition } from "@/lib/content/tools/types"
import ToolsGrid from "@/components/tools/tools-grid"
import ToolView from "@/components/tools/tool-view"

export default function ToolsPage() {
  const [activeToolId, setActiveToolId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const content = getToolsPageContent()

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
    window.addEventListener("popstate", handleHashChange)
    return () => {
      window.removeEventListener("hashchange", handleHashChange)
      window.removeEventListener("popstate", handleHashChange)
    }
  }, [])

  const selectTool = useCallback((id: string) => {
    setActiveToolId(id)
    window.location.hash = id
    window.scrollTo(0, 0)
  }, [])

  const goBack = useCallback(() => {
    setActiveToolId(null)
    history.pushState(null, "", window.location.pathname)
  }, [])

  const filteredTools = searchQuery
    ? searchTools(searchQuery)
    : content.tools

  if (activeToolId) {
    return (
      <ToolView
        toolId={activeToolId}
        onBack={goBack}
        backLabel={content.backToGridLabel}
      />
    )
  }

  return (
    <ToolsGrid
      tools={filteredTools}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder={content.searchPlaceholder}
      heading={content.heading}
      description={content.description}
      onSelectTool={selectTool}
    />
  )
}