"use client"

import { useState, useMemo } from "react"
import CopyButton from "@/components/tools/shared/copy-button"

export default function RemoveDuplicates() {
  const [input, setInput] = useState("")
  const [mode, setMode] = useState<"lines" | "words">("lines")
  const [caseSensitive, setCaseSensitive] = useState(true)
  const [sortOutput, setSortOutput] = useState(false)

  const result = useMemo(() => {
    if (!input.trim()) return { output: "", removed: 0, total: 0 }

    if (mode === "lines") {
      const lines = input.split("\n")
      const total = lines.length
      const seen = new Set<string>()
      const unique: string[] = []
      for (const line of lines) {
        const key = caseSensitive ? line : line.toLowerCase()
        if (!seen.has(key)) {
          seen.add(key)
          unique.push(line)
        }
      }
      const output = sortOutput ? [...unique].sort() : unique
      return { output: output.join("\n"), removed: total - unique.length, total }
    } else {
      const words = input.split(/\s+/).filter(Boolean)
      const total = words.length
      const seen = new Set<string>()
      const unique: string[] = []
      for (const word of words) {
        const key = caseSensitive ? word : word.toLowerCase()
        if (!seen.has(key)) {
          seen.add(key)
          unique.push(word)
        }
      }
      const output = sortOutput ? [...unique].sort() : unique
      return { output: output.join(" "), removed: total - unique.length, total }
    }
  }, [input, mode, caseSensitive, sortOutput])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Mode:</label>
          <button
            onClick={() => setMode("lines")}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              mode === "lines" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Lines
          </button>
          <button
            onClick={() => setMode("words")}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              mode === "words" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Words
          </button>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
            className="rounded border-border"
          />
          Case sensitive
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={sortOutput}
            onChange={(e) => setSortOutput(e.target.checked)}
            className="rounded border-border"
          />
          Sort output
        </label>
      </div>

      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === "lines" ? "Paste lines here (one per line)..." : "Paste words here..."}
          className="w-full min-h-[150px] sm:min-h-[200px] p-4 rounded-lg border border-border bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y font-mono text-sm"
        />
        {input && <div className="absolute top-2 right-2"><CopyButton text={input} /></div>}
      </div>

      {input.trim() && (
        <>
          <div className="flex gap-4 text-sm">
            <span className="text-muted-foreground">Total: {result.total}</span>
            <span className="text-emerald-400">Unique: {result.total - result.removed}</span>
            <span className="text-red-400">Removed: {result.removed}</span>
          </div>

          <div className="relative">
            <textarea
              readOnly
              value={result.output}
              className="w-full min-h-[150px] sm:min-h-[200px] p-4 rounded-lg border border-border bg-muted/30 text-foreground resize-y font-mono text-sm"
            />
            {result.output && <div className="absolute top-2 right-2"><CopyButton text={result.output} /></div>}
          </div>
        </>
      )}
    </div>
  )
}