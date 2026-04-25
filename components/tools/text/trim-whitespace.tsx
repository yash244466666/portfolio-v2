"use client"

import { useState, useMemo } from "react"
import CopyButton from "@/components/tools/shared/copy-button"

export default function TrimWhitespace() {
  const [input, setInput] = useState("")
  const [trimLeading, setTrimLeading] = useState(true)
  const [trimTrailing, setTrimTrailing] = useState(true)
  const [collapseSpaces, setCollapseSpaces] = useState(false)
  const [removeBlankLines, setRemoveBlankLines] = useState(false)

  const result = useMemo(() => {
    if (!input) return { output: "", beforeChars: 0, afterChars: 0 }

    const beforeChars = input.length
    let output = input

    if (trimLeading) {
      output = output
        .split("\n")
        .map((line) => line.replace(/^\s+/, ""))
        .join("\n")
    }

    if (trimTrailing) {
      output = output
        .split("\n")
        .map((line) => line.replace(/\s+$/, ""))
        .join("\n")
    }

    if (collapseSpaces) {
      output = output
        .split("\n")
        .map((line) => line.replace(/ {2,}/g, " "))
        .join("\n")
    }

    if (removeBlankLines) {
      output = output
        .split("\n")
        .filter((line) => line.trim() !== "")
        .join("\n")
    }

    const afterChars = output.length

    return { output, beforeChars, afterChars }
  }, [input, trimLeading, trimTrailing, collapseSpaces, removeBlankLines])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={trimLeading}
            onChange={(e) => setTrimLeading(e.target.checked)}
            className="rounded border-border accent-primary"
          />
          Trim leading
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={trimTrailing}
            onChange={(e) => setTrimTrailing(e.target.checked)}
            className="rounded border-border accent-primary"
          />
          Trim trailing
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={collapseSpaces}
            onChange={(e) => setCollapseSpaces(e.target.checked)}
            className="rounded border-border accent-primary"
          />
          Collapse multiple spaces
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={removeBlankLines}
            onChange={(e) => setRemoveBlankLines(e.target.checked)}
            className="rounded border-border accent-primary"
          />
          Remove blank lines
        </label>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Input</label>
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your text here..."
            className="w-full min-h-[150px] sm:min-h-[200px] p-4 rounded-lg border border-border bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y font-mono text-sm"
          />
          {input && <div className="absolute top-2 right-2"><CopyButton text={input} /></div>}
        </div>
      </div>

      {input && (
        <>
          <div className="flex gap-4 text-sm">
            <span className="text-muted-foreground">Before: {result.beforeChars} chars</span>
            <span className="text-emerald-400">After: {result.afterChars} chars</span>
            <span className="text-primary">
              Saved: {result.beforeChars - result.afterChars} chars
            </span>
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