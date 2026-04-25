"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import CopyButton from "@/components/tools/shared/copy-button"

interface InvisibleChar {
  name: string
  char: string
  code: string
  pattern: RegExp
  count: number
}

export default function InvisibleCharacterDetector() {
  const [input, setInput] = useState("")
  const [cleanedOutput, setCleanedOutput] = useState("")

  const detection = useMemo(() => {
    if (!input) return { chars: [] as InvisibleChar[], totalInvisible: 0, totalChars: 0 }

    const definitions: { name: string; char: string; code: string; pattern: RegExp }[] = [
      { name: "Zero-Width Space", char: "\u200B", code: "U+200B", pattern: /\u200B/g },
      { name: "Zero-Width Joiner", char: "\u200D", code: "U+200D", pattern: /\u200D/g },
      { name: "Zero-Width Non-Joiner", char: "\u200C", code: "U+200C", pattern: /\u200C/g },
      { name: "Word Joiner", char: "\u2060", code: "U+2060", pattern: /\u2060/g },
      { name: "BOM", char: "\uFEFF", code: "U+FEFF", pattern: /\uFEFF/g },
      { name: "Non-Breaking Space", char: "\u00A0", code: "U+00A0", pattern: /\u00A0/g },
      { name: "Soft Hyphen", char: "\u00AD", code: "U+00AD", pattern: /\u00AD/g },
      { name: "Narrow No-Break Space", char: "\u202F", code: "U+202F", pattern: /\u202F/g },
      { name: "En Space", char: "\u2002", code: "U+2002", pattern: /\u2002/g },
      { name: "Em Space", char: "\u2003", code: "U+2003", pattern: /\u2003/g },
      { name: "Line Separator", char: "\u2028", code: "U+2028", pattern: /\u2028/g },
      { name: "Paragraph Separator", char: "\u2029", code: "U+2029", pattern: /\u2029/g },
      { name: "Left-to-Right Mark", char: "\u200E", code: "U+200E", pattern: /\u200E/g },
      { name: "Right-to-Left Mark", char: "\u200F", code: "U+200F", pattern: /\u200F/g },
      { name: "Left-to-Right Embedding", char: "\u202A", code: "U+202A", pattern: /\u202A/g },
      { name: "Right-to-Left Embedding", char: "\u202B", code: "U+202B", pattern: /\u202B/g },
      { name: "Pop Directional Formatting", char: "\u202C", code: "U+202C", pattern: /\u202C/g },
      { name: "Interlinear Annotation", char: "\uFFF9", code: "U+FFF9", pattern: /[\uFFF9\uFFFA\uFFFB]/g },
      { name: "Object Replacement", char: "\uFFFC", code: "U+FFFC", pattern: /\uFFFC/g },
      { name: "Replacement Character", char: "\uFFFD", code: "U+FFFD", pattern: /\uFFFD/g },
    ]

    const chars: InvisibleChar[] = []
    let totalInvisible = 0

    for (const def of definitions) {
      const matches = input.match(def.pattern)
      if (matches && matches.length > 0) {
        chars.push({
          name: def.name,
          char: def.char,
          code: def.code,
          pattern: def.pattern,
          count: matches.length,
        })
        totalInvisible += matches.length
      }
    }

    return { chars, totalInvisible, totalChars: input.length }
  }, [input])

  const handleClean = () => {
    const invisiblePattern = /[\u200B\u200C\u200D\u200E\u200F\u202A\u202B\u202C\u2028\u2029\u2060\uFEFF\u00A0\u00AD\u202F\u2002\u2003\uFFF9\uFFFA\uFFFB\uFFFC\uFFFD]/g
    const cleaned = input.replace(invisiblePattern, "")
    setCleanedOutput(cleaned)
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Input</label>
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setCleanedOutput("")
            }}
            placeholder="Paste text to detect invisible characters..."
            className="w-full min-h-[150px] sm:min-h-[200px] p-4 rounded-lg border border-border bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y font-mono text-sm"
          />
          {input && <div className="absolute top-2 right-2"><CopyButton text={input} /></div>}
        </div>
      </div>

      {input && (
        <>
          <div className="flex gap-4 text-sm">
            <span className="text-muted-foreground">Total chars: {detection.totalChars}</span>
            <span className="text-red-400">
              Invisible: {detection.totalInvisible}
            </span>
          </div>

          {detection.chars.length > 0 && (
            <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-foreground mb-3">
                Detected Invisible Characters
              </h3>
              <div className="space-y-2">
                {detection.chars.map((char) => (
                  <div
                    key={char.code}
                    className="flex items-center justify-between py-1.5 px-3 rounded-md bg-background/50"
                  >
                    <div className="flex items-center gap-3">
                      <code className="text-xs px-1.5 py-0.5 bg-muted rounded text-foreground">
                        {char.code}
                      </code>
                      <span className="text-sm text-foreground">{char.name}</span>
                    </div>
                    <span className="text-sm text-red-400 font-medium">
                      {char.count}x
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {detection.chars.length > 0 && (
            <Button onClick={handleClean} variant="outline" className="w-full">
              Remove All Invisible Characters
            </Button>
          )}

          {detection.totalInvisible === 0 && input && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-sm text-emerald-400">
              No invisible characters detected!
            </div>
          )}

          {cleanedOutput && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">Cleaned Output</label>
                <CopyButton text={cleanedOutput} />
              </div>
              <div className="w-full min-h-[150px] sm:min-h-[200px] p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-foreground font-mono text-sm whitespace-pre-wrap break-all overflow-auto">
                {cleanedOutput}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}