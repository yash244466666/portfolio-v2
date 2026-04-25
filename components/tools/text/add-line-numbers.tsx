"use client"

import { useState, useMemo } from "react"
import CopyButton from "@/components/tools/shared/copy-button"

const separatorOptions = [
  { id: "dot", label: "Dot (1.)" },
  { id: "colon", label: "Colon (1:)" },
  { id: "bracket", label: "Bracket (1])" },
  { id: "paren", label: "Paren (1))" },
  { id: "dash", label: "Dash (1-)" },
  { id: "custom", label: "Custom" },
]

export default function AddLineNumbers() {
  const [input, setInput] = useState("")
  const [startNumber, setStartNumber] = useState(1)
  const [separator, setSeparator] = useState("dot")
  const [customSeparator, setCustomSeparator] = useState(" | ")
  const [padding, setPadding] = useState<"auto" | "none">("auto")

  const result = useMemo(() => {
    if (!input.trim()) return ""

    const lines = input.split("\n")
    const totalLines = lines.length
    const endNumber = startNumber + totalLines - 1
    const maxDigits = String(endNumber).length

    const sepMap: Record<string, string> = {
      dot: ". ",
      colon: ": ",
      bracket: "] ",
      paren: ") ",
      dash: "- ",
      custom: customSeparator,
    }
    const sep = sepMap[separator] || ". "

    return lines
      .map((line, i) => {
        const num = startNumber + i
        const numStr = padding === "auto" ? String(num).padStart(maxDigits, " ") : String(num)
        return `${numStr}${sep}${line}`
      })
      .join("\n")
  }, [input, startNumber, separator, customSeparator, padding])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Start number</label>
          <input
            type="number"
            value={startNumber}
            onChange={(e) => setStartNumber(Math.max(0, parseInt(e.target.value) || 0))}
            min={0}
            className="w-full p-2 rounded-lg border border-border bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Padding</label>
          <div className="flex gap-1 p-1 bg-muted/50 rounded-lg border border-border/50">
            <button
              onClick={() => setPadding("auto")}
              className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                padding === "auto" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Auto
            </button>
            <button
              onClick={() => setPadding("none")}
              className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                padding === "none" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              None
            </button>
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Separator</label>
        <div className="flex flex-wrap gap-2">
          {separatorOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSeparator(opt.id)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                separator === opt.id ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {separator === "custom" && (
          <input
            type="text"
            value={customSeparator}
            onChange={(e) => setCustomSeparator(e.target.value)}
            placeholder="Enter custom separator..."
            className="mt-2 w-full p-2 rounded-lg border border-border bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        )}
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

      {input.trim() && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Result</label>
            {result && <CopyButton text={result} />}
          </div>
          <div className="w-full min-h-[150px] sm:min-h-[200px] p-4 rounded-lg border border-border bg-muted/30 text-foreground font-mono text-sm whitespace-pre-wrap break-all overflow-auto">
            {result}
          </div>
        </div>
      )}
    </div>
  )
}