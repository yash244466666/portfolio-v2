"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import CopyButton from "@/components/tools/shared/copy-button"

function minifySvg(svg: string): string {
  return svg
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .replace(/>\s+</g, "><")
    .replace(/\s*=\s*/g, "=")
    .replace(/;\s*/g, ";")
    .trim()
}

function prettyPrintSvg(svg: string): string {
  let formatted = ""
  let indent = 0
  const lines = svg.replace(/>\s*</g, ">\n<").split("\n")

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    if (trimmed.startsWith("</")) indent = Math.max(0, indent - 1)
    formatted += "  ".repeat(indent) + trimmed + "\n"
    if (trimmed.startsWith("<") && !trimmed.startsWith("</") && !trimmed.endsWith("/>") && !trimmed.includes("</")) {
      indent++
    }
  }
  return formatted.trim()
}

export default function SvgOptimizer() {
  const [input, setInput] = useState("")

  const minified = useMemo(() => input ? minifySvg(input) : "", [input])
  const pretty = useMemo(() => input ? prettyPrintSvg(minified) : "", [input])

  const formatBytes = (str: string) => {
    const bytes = new Blob([str]).size
    return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`
  }

  const savings = input && minified ? Math.round((1 - new Blob([minified]).size / new Blob([input]).size) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-foreground">SVG Input</label>
          {input && <CopyButton text={input} />}
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your SVG here..."
          className="w-full min-h-[200px] p-4 rounded-lg border border-border bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y font-mono text-sm"
        />
      </div>

      {input && (
        <div className="flex gap-4 text-sm">
          <span className="text-muted-foreground">Original: {formatBytes(input)}</span>
          <span className="text-muted-foreground">Minified: {formatBytes(minified)}</span>
          {savings > 0 && <span className="text-emerald-400">{savings}% smaller</span>}
        </div>
      )}

      {minified && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Minified</label>
            <CopyButton text={minified} />
          </div>
          <textarea
            readOnly
            value={minified}
            className="w-full min-h-[80px] p-4 rounded-lg border border-border bg-muted/30 text-foreground resize-y font-mono text-sm break-all"
          />
        </div>
      )}

      {pretty && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Pretty Printed</label>
            <CopyButton text={pretty} />
          </div>
          <textarea
            readOnly
            value={pretty}
            className="w-full min-h-[200px] p-4 rounded-lg border border-border bg-muted/30 text-foreground resize-y font-mono text-sm"
          />
        </div>
      )}

      {input && (
        <div className="border border-border/50 rounded-lg overflow-hidden bg-white p-4 inline-block w-full">
          <div dangerouslySetInnerHTML={{ __html: minified }} className="[&_svg]:max-w-full [&_svg]:h-auto" />
        </div>
      )}
    </div>
  )
}