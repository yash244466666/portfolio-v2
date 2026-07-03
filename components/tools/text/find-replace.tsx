"use client"

import { useState, useMemo } from "react"
import { ToolResult } from "@/components/tools/shared/tool-result"
import { Button } from "@/components/ui/button"
import CopyButton from "@/components/tools/shared/copy-button"

export default function FindReplace() {
  const [findPattern, setFindPattern] = useState("")
  const [replaceWith, setReplaceWith] = useState("")
  const [sourceText, setSourceText] = useState("")
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [regexMode, setRegexMode] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)

  const result = useMemo(() => {
    if (!findPattern || !sourceText) {
      return { output: sourceText, matchCount: 0, error: "" }
    }

    try {
      let pattern = findPattern
      if (wholeWord && !regexMode) {
        pattern = `\\b${pattern}\\b`
      } else if (wholeWord && regexMode) {
        pattern = `(?<=^|\\W)${pattern}(?=$|\\W)`
      }

      const flags = caseSensitive ? "g" : "gi"
      const regex = regexMode ? new RegExp(pattern, flags) : new RegExp(escapeRegex(wholeWord ? findPattern : pattern), flags)

      let matchCount = 0
      const output = sourceText.replace(regex, (match) => {
        matchCount++
        return replaceWith
      })

      return { output, matchCount, error: "" }
    } catch (e) {
      return { output: sourceText, matchCount: 0, error: (e as Error).message }
    }
  }, [findPattern, replaceWith, sourceText, caseSensitive, regexMode, wholeWord])

  const highlightedOutput = useMemo(() => {
    if (!findPattern || !sourceText || result.error) return result.output

    try {
      let pattern = findPattern
      if (wholeWord && !regexMode) {
        pattern = `\\b${pattern}\\b`
      } else if (wholeWord && regexMode) {
        pattern = `(?<=^|\\W)${pattern}(?=$|\\W)`
      }

      const flags = caseSensitive ? "g" : "gi"
      const regex = regexMode ? new RegExp(`(${pattern})`, flags) : new RegExp(`(${escapeRegex(wholeWord ? findPattern : pattern)})`, flags)

      return result.output.split(regex)
    } catch {
      return [result.output]
    }
  }, [findPattern, sourceText, result.output, result.error, caseSensitive, regexMode, wholeWord])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Find pattern</label>
          <textarea
            value={findPattern}
            onChange={(e) => setFindPattern(e.target.value)}
            placeholder="Enter text or regex pattern to find..."
            className="w-full min-h-[80px] p-3 rounded-lg border border-border bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y font-mono text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Replace with</label>
          <textarea
            value={replaceWith}
            onChange={(e) => setReplaceWith(e.target.value)}
            placeholder="Enter replacement text..."
            className="w-full min-h-[80px] p-3 rounded-lg border border-border bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y font-mono text-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
            className="rounded border-border accent-primary"
          />
          Case sensitive
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={regexMode}
            onChange={(e) => setRegexMode(e.target.checked)}
            className="rounded border-border accent-primary"
          />
          Regex mode
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={wholeWord}
            onChange={(e) => setWholeWord(e.target.checked)}
            className="rounded border-border accent-primary"
          />
          Whole word
        </label>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Source text</label>
        <div className="relative">
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Paste your text here..."
            className="w-full min-h-[150px] sm:min-h-[200px] p-4 rounded-lg border border-border bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y font-mono text-sm"
          />
          {sourceText && <div className="absolute top-2 right-2"><CopyButton text={sourceText} /></div>}
        </div>
      </div>

      {result.error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
          {result.error}
        </div>
      )}

      {sourceText && findPattern && !result.error && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {result.matchCount} match{result.matchCount !== 1 ? "es" : ""} found
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSourceText(result.output)
                setFindPattern("")
                setReplaceWith("")
              }}
            >
              Apply Changes
            </Button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Result</label>
              {result.output && <CopyButton text={result.output} />}
            </div>
            <ToolResult className="w-full min-h-[150px] sm:min-h-[200px]     text-foreground font-mono text-sm whitespace-pre-wrap break-all overflow-auto">
              {Array.isArray(highlightedOutput) ? highlightedOutput.map((part, i) => (
                <span key={i}>{part}</span>
              )) : result.output}
            </ToolResult>
          </div>
        </>
      )}
    </div>
  )
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}