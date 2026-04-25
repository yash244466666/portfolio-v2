"use client"

import { useState, useMemo } from "react"
import TabSwitcher from "@/components/tools/shared/tab-switcher"
import CopyButton from "@/components/tools/shared/copy-button"

const sortModes = [
  { id: "az", label: "A \u2192 Z" },
  { id: "za", label: "Z \u2192 A" },
  { id: "numeric", label: "Numeric" },
  { id: "reverse", label: "Reverse" },
  { id: "shuffle", label: "Shuffle" },
]

export default function SortLines() {
  const [input, setInput] = useState("")
  const [sortMode, setSortMode] = useState("az")
  const [removeBlank, setRemoveBlank] = useState(false)
  const [removeDuplicates, setRemoveDuplicates] = useState(false)

  const result = useMemo(() => {
    if (!input.trim()) return { output: "", total: 0, removed: 0 }

    let lines = input.split("\n")
    const total = lines.length

    if (removeBlank) {
      lines = lines.filter((line) => line.trim() !== "")
    }

    if (removeDuplicates) {
      const seen = new Set<string>()
      lines = lines.filter((line) => {
        if (seen.has(line)) return false
        seen.add(line)
        return true
      })
    }

    switch (sortMode) {
      case "az":
        lines.sort((a, b) => a.localeCompare(b))
        break
      case "za":
        lines.sort((a, b) => b.localeCompare(a))
        break
      case "numeric":
        lines.sort((a, b) => {
          const numA = parseFloat(a.replace(/[^\d.-]/g, "")) || 0
          const numB = parseFloat(b.replace(/[^\d.-]/g, "")) || 0
          return numA - numB
        })
        break
      case "reverse":
        lines.reverse()
        break
      case "shuffle": {
        for (let i = lines.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[lines[i], lines[j]] = [lines[j], lines[i]]
        }
        break
      }
    }

    return { output: lines.join("\n"), total, removed: total - lines.length }
  }, [input, sortMode, removeBlank, removeDuplicates])

  return (
    <div className="space-y-6">
      <TabSwitcher tabs={sortModes} activeTab={sortMode} onTabChange={setSortMode} />

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={removeBlank}
            onChange={(e) => setRemoveBlank(e.target.checked)}
            className="rounded border-border accent-primary"
          />
          Remove blank lines
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={removeDuplicates}
            onChange={(e) => setRemoveDuplicates(e.target.checked)}
            className="rounded border-border accent-primary"
          />
          Remove duplicates
        </label>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Input</label>
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste lines here (one per line)..."
            className="w-full min-h-[150px] sm:min-h-[200px] p-4 rounded-lg border border-border bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y font-mono text-sm"
          />
          {input && <div className="absolute top-2 right-2"><CopyButton text={input} /></div>}
        </div>
      </div>

      {input.trim() && (
        <>
          <div className="flex gap-4 text-sm">
            <span className="text-muted-foreground">Total lines: {result.total}</span>
            {result.removed > 0 && (
              <span className="text-red-400">Removed: {result.removed}</span>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Output</label>
              {result.output && <CopyButton text={result.output} />}
            </div>
            <div className="w-full min-h-[150px] sm:min-h-[200px] p-4 rounded-lg border border-border bg-muted/30 text-foreground font-mono text-sm whitespace-pre-wrap break-all overflow-auto">
              {result.output}
            </div>
          </div>
        </>
      )}
    </div>
  )
}