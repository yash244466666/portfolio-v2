"use client"

import { useState, useMemo } from "react"
import { ToolResult } from "@/components/tools/shared/tool-result"
import CopyButton from "@/components/tools/shared/copy-button"

const conversions: Record<string, { label: string; convert: (t: string) => string }> = {
  upper: { label: "UPPERCASE", convert: (t) => t.toUpperCase() },
  lower: { label: "lowercase", convert: (t) => t.toLowerCase() },
  title: {
    label: "Title Case",
    convert: (t) => t.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()),
  },
  sentence: {
    label: "Sentence case",
    convert: (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase().replace(/([.!?]\s*)(\w)/g, (_, p, c) => p + c.toUpperCase()),
  },
  camel: {
    label: "camelCase",
    convert: (t) =>
      t.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/^[A-Z]/, (c) => c.toLowerCase()),
  },
  pascal: {
    label: "PascalCase",
    convert: (t) =>
      t.toLowerCase().replace(/(^|[^a-zA-Z0-9]+)(.)/g, (_, _s, c) => c.toUpperCase()),
  },
  snake: {
    label: "snake_case",
    convert: (t) =>
      t.replace(/([a-z])([A-Z])/g, "$1_$2").replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "").toLowerCase(),
  },
  kebab: {
    label: "kebab-case",
    convert: (t) =>
      t.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase(),
  },
}

export default function CaseConverter() {
  const [input, setInput] = useState("")

  const results = useMemo(() => {
    if (!input) return {}
    const out: Record<string, string> = {}
    for (const [key, { convert }] of Object.entries(conversions)) {
      out[key] = convert(input)
    }
    return out
  }, [input])

  return (
    <div className="space-y-6">
      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste your text here..."
          className="w-full min-h-[120px] sm:min-h-[160px] p-4 rounded-lg border border-border bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
        />
        {input && <div className="absolute top-2 right-2"><CopyButton text={input} /></div>}
      </div>

      {input && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(conversions).map(([key, { label }]) => (
            <ToolResult key={key} className="group     relative">
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className="text-sm text-foreground break-all line-clamp-3">{results[key]}</p>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <CopyButton text={results[key]} />
              </div>
            </ToolResult>
          ))}
        </div>
      )}
    </div>
  )
}