"use client"

import { useState, useCallback, useMemo } from "react"
import { Code2, TreePine, Braces, Minimize2, Download, Trash2, ChevronDown, ChevronsUpDown } from "lucide-react"
import { CodePanel } from "./code-panel"
import { TreePanel } from "./tree-panel"
import TabSwitcher from "@/components/tools/shared/tab-switcher"
import CopyButton from "@/components/tools/shared/copy-button"
import { getAllPaths, SAMPLE_JSON } from "./json-tree-utils"

const VIEW_TABS = [
  { id: "code", label: "Code" },
  { id: "tree", label: "Tree" },
]

export default function JsonEditor() {
  const [jsonString, setJsonString] = useState(SAMPLE_JSON)
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set([""]))
  const [activeMobileTab, setActiveMobileTab] = useState("code")

  const isValid = useMemo(() => {
    try {
      JSON.parse(jsonString)
      return true
    } catch {
      return false
    }
  }, [jsonString])

  const parseError = useMemo(() => {
    try {
      JSON.parse(jsonString)
      return null
    } catch (e) {
      return e instanceof Error ? e.message : "Invalid JSON"
    }
  }, [jsonString])

  const handleCodeChange = useCallback((newString: string) => {
    setJsonString(newString)
  }, [])

  const handleTreeChange = useCallback((newObj: unknown) => {
    setJsonString(JSON.stringify(newObj, null, 2))
  }, [])

  const handleFormat = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonString)
      setJsonString(JSON.stringify(parsed, null, 2))
    } catch { /* keep current string if invalid */ }
  }, [jsonString])

  const handleMinify = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonString)
      setJsonString(JSON.stringify(parsed))
    } catch { /* keep current string if invalid */ }
  }, [jsonString])

  const handleClear = useCallback(() => {
    setJsonString("")
    setExpandedPaths(new Set())
  }, [])

  const handleTogglePath = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }, [])

  const handleExpandAll = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonString)
      setExpandedPaths(new Set(getAllPaths(parsed)))
    } catch { /* ignore */ }
  }, [jsonString])

  const handleCollapseAll = useCallback(() => {
    setExpandedPaths(new Set([""]))
  }, [])

  const handleDownload = useCallback(() => {
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "data.json"
    a.click()
    URL.revokeObjectURL(url)
  }, [jsonString])

  const btnClass = "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap"
  const btnPrimary = `${btnClass} bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20`
  const btnSecondary = `${btnClass} bg-muted/50 text-muted-foreground border border-border/50 hover:text-foreground hover:bg-muted`

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <button onClick={handleFormat} disabled={!isValid} className={btnPrimary}>
          <Braces className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Format</span>
        </button>
        <button onClick={handleMinify} disabled={!isValid} className={btnSecondary}>
          <Minimize2 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Minify</span>
        </button>
        <div className="w-px h-5 bg-border/50 hidden sm:block" />
        <button onClick={handleExpandAll} disabled={!isValid} className={btnSecondary}>
          <ChevronsUpDown className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Expand</span>
        </button>
        <button onClick={handleCollapseAll} disabled={!isValid} className={btnSecondary}>
          <ChevronDown className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Collapse</span>
        </button>
        <div className="w-px h-5 bg-border/50 hidden sm:block" />
        {jsonString && <CopyButton text={jsonString} />}
        <button onClick={handleDownload} disabled={!jsonString} className={btnSecondary}>
          <Download className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Download</span>
        </button>
        <button onClick={handleClear} className={`${btnSecondary} hover:text-red-400`}>
          <Trash2 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Clear</span>
        </button>
        <div className="flex-1" />
        {/* Status indicator */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border ${
          jsonString.trim() === ""
            ? "bg-muted/50 text-muted-foreground border-border/50"
            : isValid
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border-red-500/20"
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${
            jsonString.trim() === "" ? "bg-muted-foreground" : isValid ? "bg-emerald-400" : "bg-red-400"
          }`} />
          {jsonString.trim() === "" ? "Empty" : isValid ? "Valid" : "Invalid"}
        </div>
      </div>

      {/* Mobile tab switcher */}
      <div className="lg:hidden">
        <TabSwitcher tabs={VIEW_TABS} activeTab={activeMobileTab} onTabChange={setActiveMobileTab} />
      </div>

      {/* Editor panels */}
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-3" style={{ minHeight: "400px" }}>
        {/* Code panel */}
        <div className={`flex flex-col gap-2 ${activeMobileTab !== "code" ? "hidden lg:flex" : ""}`}>
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-foreground">Code</span>
          </div>
          <div className="flex-1" style={{ minHeight: "350px" }}>
            <CodePanel jsonString={jsonString} onChange={handleCodeChange} />
          </div>
        </div>

        {/* Tree panel */}
        <div className={`flex flex-col gap-2 ${activeMobileTab !== "tree" ? "hidden lg:flex" : ""}`}>
          <div className="flex items-center gap-2">
            <TreePine className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium text-foreground">Tree</span>
          </div>
          <div className="flex-1" style={{ minHeight: "350px" }}>
            <TreePanel
              jsonString={jsonString}
              expandedPaths={expandedPaths}
              onToggle={handleTogglePath}
              onChange={handleTreeChange}
            />
          </div>
        </div>
      </div>

      {/* Error bar */}
      {parseError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400 font-mono break-all">
          {parseError}
        </div>
      )}
    </div>
  )
}