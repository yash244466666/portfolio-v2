"use client"

import { useState, useMemo } from "react"
import TabSwitcher from "@/components/tools/shared/tab-switcher"
import CopyButton from "@/components/tools/shared/copy-button"

const modes = [
  { id: "chars", label: "Reverse Characters" },
  { id: "words", label: "Reverse Words" },
  { id: "lines", label: "Reverse Lines" },
]

export default function ReverseText() {
  const [input, setInput] = useState("")
  const [mode, setMode] = useState("chars")

  const output = useMemo(() => {
    if (!input) return ""

    switch (mode) {
      case "chars":
        return [...input].reverse().join("")
      case "words":
        return input
          .split("\n")
          .map((line) => line.split(/\s+/).filter(Boolean).reverse().join(" "))
          .join("\n")
      case "lines":
        return input.split("\n").reverse().join("\n")
      default:
        return input
    }
  }, [input, mode])

  return (
    <div className="space-y-6">
      <TabSwitcher tabs={modes} activeTab={mode} onTabChange={setMode} />

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Input</label>
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste your text here..."
            className="w-full min-h-[150px] sm:min-h-[200px] p-4 rounded-lg border border-border bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
          />
          {input && <div className="absolute top-2 right-2"><CopyButton text={input} /></div>}
        </div>
      </div>

      {input && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Output</label>
            {output && <CopyButton text={output} />}
          </div>
          <div className="w-full min-h-[150px] sm:min-h-[200px] p-4 rounded-lg border border-border bg-muted/30 text-foreground font-mono text-sm whitespace-pre-wrap break-all overflow-auto">
            {output}
          </div>
        </div>
      )}
    </div>
  )
}