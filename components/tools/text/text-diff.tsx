"use client"

import { useState } from "react"
import { ToolResult } from "@/components/tools/shared/tool-result"
import * as Diff from "diff"
import CopyButton from "@/components/tools/shared/copy-button"

export default function TextDiff() {
  const [original, setOriginal] = useState("")
  const [modified, setModified] = useState("")

  const diffs = original || modified
    ? Diff.diffLines(original, modified)
    : []

  const addedLines = diffs.filter((p) => p.added).reduce((s, p) => s + p.count || 0, 0)
  const removedLines = diffs.filter((p) => p.removed).reduce((s, p) => s + p.count || 0, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Original</label>
            {original && <CopyButton text={original} />}
          </div>
          <textarea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            placeholder="Paste original text..."
            className="w-full min-h-[200px] sm:min-h-[280px] p-4 rounded-lg border border-border bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y font-mono text-sm"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Modified</label>
            {modified && <CopyButton text={modified} />}
          </div>
          <textarea
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            placeholder="Paste modified text..."
            className="w-full min-h-[200px] sm:min-h-[280px] p-4 rounded-lg border border-border bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y font-mono text-sm"
          />
        </div>
      </div>

      {(addedLines > 0 || removedLines > 0) && (
        <div className="flex gap-4 text-sm">
          <span className="text-emerald-400">+{addedLines} lines added</span>
          <span className="text-red-400">-{removedLines} lines removed</span>
        </div>
      )}

      {diffs.length > 0 && (
        <ToolResult className="    overflow-x-auto">
          <pre className="text-sm font-mono whitespace-pre-wrap">
            {diffs.map((part, i) => (
              <span
                key={i}
                className={
                  part.added
                    ? "bg-emerald-500/20 text-emerald-300"
                    : part.removed
                    ? "bg-red-500/20 text-red-300 line-through"
                    : "text-muted-foreground"
                }
              >
                {part.value}
              </span>
            ))}
          </pre>
        </ToolResult>
      )}
    </div>
  )
}