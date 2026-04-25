"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { generateLoremIpsum } from "@/lib/tools/lorem-data"
import CopyButton from "@/components/tools/shared/copy-button"

export default function LoremIpsumGenerator() {
  const [count, setCount] = useState(3)
  const [unit, setUnit] = useState<"paragraphs" | "sentences" | "words">("paragraphs")
  const [output, setOutput] = useState("")

  const handleGenerate = useCallback(() => {
    setOutput(generateLoremIpsum(count, unit))
  }, [count, unit])

  const units = [
    { id: "paragraphs" as const, label: "Paragraphs" },
    { id: "sentences" as const, label: "Sentences" },
    { id: "words" as const, label: "Words" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium text-foreground block mb-2">Count</label>
          <Input
            type="number"
            min={1}
            max={unit === "words" ? 500 : unit === "sentences" ? 50 : 10}
            value={count}
            onChange={(e) => setCount(Math.max(1, Number(e.target.value)))}
            className="bg-background/50"
          />
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium text-foreground block mb-2">Unit</label>
          <div className="flex gap-2">
            {units.map((u) => (
              <button
                key={u.id}
                onClick={() => setUnit(u.id)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  unit === u.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-end">
          <Button onClick={handleGenerate} className="w-full sm:w-auto">
            Generate
          </Button>
        </div>
      </div>

      {output && (
        <div className="relative">
          <textarea
            readOnly
            value={output}
            className="w-full min-h-[200px] sm:min-h-[300px] p-4 rounded-lg border border-border bg-muted/30 text-foreground resize-y text-sm"
          />
          <div className="absolute top-2 right-2">
            <CopyButton text={output} />
          </div>
        </div>
      )}
    </div>
  )
}