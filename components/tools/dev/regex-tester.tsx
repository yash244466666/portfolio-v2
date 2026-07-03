"use client"

import { useState, useMemo } from "react"
import { ToolResult } from "@/components/tools/shared/tool-result"
import { Input } from "@/components/ui/input"

export default function RegexTester() {
  const [pattern, setPattern] = useState("\\b\\w+@\\w+\\.\\w+\\b")
  const [flags, setFlags] = useState("gi")
  const [testString, setTestString] = useState("Contact us at hello@example.com or support@test.org for help.")

  const result = useMemo(() => {
    try {
      const regex = new RegExp(pattern, flags)
      const matches: { match: string; index: number; groups: string[] }[] = []
      let m: RegExpExecArray | null

      if (flags.includes("g")) {
        const re = new RegExp(pattern, flags)
        while ((m = re.exec(testString)) !== null) {
          matches.push({ match: m[0], index: m.index, groups: m.slice(1) })
          if (m[0].length === 0) re.lastIndex++
        }
      } else {
        m = regex.exec(testString)
        if (m) matches.push({ match: m[0], index: m.index, groups: m.slice(1) })
      }

      return { matches, error: null }
    } catch (e) {
      return { matches: [], error: e instanceof Error ? e.message : "Invalid regex" }
    }
  }, [pattern, flags, testString])

  const highlightText = useMemo(() => {
    if (result.error || result.matches.length === 0) return testString
    try {
      const regex = new RegExp(pattern, flags)
      return testString.replace(regex, (match) => `\x01${match}\x02`)
    } catch {
      return testString
    }
  }, [pattern, flags, testString, result])

  const renderHighlighted = () => {
    const parts = highlightText.split("\x01")
    return parts.map((part, i) => {
      const [highlighted, rest] = part.split("\x02")
      if (rest !== undefined) {
        return (
          <span key={i}>
            <mark className="bg-emerald-500/30 text-emerald-300 rounded px-0.5">{highlighted}</mark>
            {rest}
          </span>
        )
      }
      return <span key={i}>{part}</span>
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px] gap-3">
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Pattern</label>
          <Input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter regex pattern..."
            className="bg-background/50 font-mono"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Flags</label>
          <Input
            type="text"
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            placeholder="gi"
            className="bg-background/50 font-mono"
          />
        </div>
      </div>

      {result.error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
          {result.error}
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Test String</label>
        <textarea
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          placeholder="Enter text to test against..."
          className="w-full min-h-[150px] p-4 rounded-lg border border-border bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y font-mono text-sm"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Highlighted Matches</label>
        <ToolResult className="min-h-[100px]     font-mono text-sm whitespace-pre-wrap break-all">
          {renderHighlighted()}
        </ToolResult>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-foreground">Matches ({result.matches.length})</label>
        </div>
        {result.matches.length > 0 ? (
          <div className="space-y-2">
            {result.matches.map((m, i) => (
              <ToolResult key={i} className="    text-sm">
                <span className="text-muted-foreground">#{i + 1} at index {m.index}:</span>{" "}
                <span className="text-emerald-400 font-mono">{m.match}</span>
                {m.groups.length > 0 && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    Groups: {m.groups.map((g, gi) => <span key={gi} className="text-amber-400 font-mono mr-2">${gi + 1}: {g || "undefined"}</span>)}
                  </div>
                )}
              </ToolResult>
            ))}
          </div>
        ) : (
          !result.error && <p className="text-sm text-muted-foreground">No matches found.</p>
        )}
      </div>
    </div>
  )
}