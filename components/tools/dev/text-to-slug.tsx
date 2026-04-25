"use client"

import { useState, useMemo } from "react"
import CopyButton from "@/components/tools/shared/copy-button"

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "it", "as", "be", "was", "are", "been",
  "being", "have", "has", "had", "do", "does", "did", "will", "would", "shall",
  "should", "may", "might", "can", "could", "this", "that", "these", "those",
])

export default function TextToSlug() {
  const [input, setInput] = useState("")
  const [separator, setSeparator] = useState("-")
  const [lowercase, setLowercase] = useState(true)
  const [removeStopWords, setRemoveStopWords] = useState(false)
  const [maxLength, setMaxLength] = useState(0)

  const result = useMemo(() => {
    let text = input
    if (!text) return { slug: "", steps: [] }

    const steps: { label: string; value: string }[] = []
    steps.push({ label: "Original", value: text })

    // Remove accents/diacritics
    text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    steps.push({ label: "Remove diacritics", value: text })

    // Remove stop words if toggled
    if (removeStopWords) {
      const words = text.split(/\s+/)
      text = words.filter((w) => !STOP_WORDS.has(w.toLowerCase())).join(" ")
      steps.push({ label: "Remove stop words", value: text })
    }

    // Replace non-alphanumeric with separator
    text = text.replace(/[^a-zA-Z0-9]+/g, separator)
    steps.push({ label: "Replace non-alphanumeric", value: text })

    // Remove leading/trailing separators
    text = text.replace(new RegExp(`^\\${separator}+|\\${separator}+$`, "g"), "")
    steps.push({ label: "Trim separators", value: text })

    // Apply lowercase
    if (lowercase) {
      text = text.toLowerCase()
      steps.push({ label: "Lowercase", value: text })
    }

    // Apply max length
    if (maxLength > 0 && text.length > maxLength) {
      text = text.substring(0, maxLength).replace(new RegExp(`\\${separator}[^\\${separator}]*$`), "")
      steps.push({ label: `Truncate to ${maxLength}`, value: text })
    }

    return { slug: text, steps }
  }, [input, separator, lowercase, removeStopWords, maxLength])

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Input Text</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste text to convert to a slug..."
          className="w-full min-h-[120px] p-4 rounded-lg border border-border bg-background/50 text-foreground text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Separator</label>
          <div className="flex gap-2">
            {["-", "_", "."].map((sep) => (
              <button
                key={sep}
                onClick={() => setSeparator(sep)}
                className={`px-4 py-2 rounded-md text-sm font-mono transition-colors ${
                  separator === sep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {sep === "-" ? "- (hyphen)" : sep === "_" ? "_ (underscore)" : ". (dot)"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLowercase(!lowercase)}
              className={`w-10 h-5 rounded-full transition-colors ${lowercase ? "bg-primary" : "bg-muted"}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform mx-0.5 ${lowercase ? "translate-x-5" : ""}`} />
            </button>
            <span className="text-sm text-foreground">Lowercase</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setRemoveStopWords(!removeStopWords)}
              className={`w-10 h-5 rounded-full transition-colors ${removeStopWords ? "bg-primary" : "bg-muted"}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform mx-0.5 ${removeStopWords ? "translate-x-5" : ""}`} />
            </button>
            <span className="text-sm text-foreground">Remove stop words</span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-2">
            Max Length <span className="text-muted-foreground">(0 = unlimited)</span>
          </label>
          <input
            type="number"
            min={0}
            value={maxLength}
            onChange={(e) => setMaxLength(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {result.slug && (
        <>
          <div className="bg-muted/30 border border-border/50 rounded-lg p-4 relative">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground">Result</p>
              <CopyButton text={result.slug} />
            </div>
            <p className="text-lg font-mono text-foreground break-all">{result.slug}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-foreground mb-2">Conversion Steps</h3>
            <div className="space-y-2">
              {result.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3 bg-background/50 border border-border/50 rounded-lg p-3">
                  <span className="text-xs text-primary font-medium whitespace-nowrap">{step.label}</span>
                  <code className="text-sm font-mono text-foreground break-all">{step.value}</code>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}