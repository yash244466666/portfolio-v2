"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import CopyButton from "@/components/tools/shared/copy-button"
import { format } from "sql-formatter"

const dialects = [
  { id: "sql", label: "SQL" },
  { id: "mysql", label: "MySQL" },
  { id: "postgresql", label: "PostgreSQL" },
]

export default function SqlFormatter() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")
  const [dialect, setDialect] = useState<string>("sql")

  const handleFormat = useCallback(() => {
    try {
      const formatted = format(input, {
        language: dialect as "sql" | "mysql" | "postgresql",
        tabWidth: 2,
      })
      setOutput(formatted)
      setError("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to format SQL")
      setOutput("")
    }
  }, [input, dialect])

  const handleMinify = useCallback(() => {
    try {
      const formatted = format(input, {
        language: dialect as "sql" | "mysql" | "postgresql",
        tabWidth: 2,
        denseOperators: true,
      })
      setOutput(formatted.replace(/\n/g, " ").replace(/\s+/g, " ").trim())
      setError("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to minify SQL")
      setOutput("")
    }
  }, [input, dialect])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">Dialect:</label>
          <div className="flex gap-1">
            {dialects.map((d) => (
              <button
                key={d.id}
                onClick={() => setDialect(d.id)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  dialect === d.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={handleFormat} size="sm">Format</Button>
        <Button onClick={handleMinify} variant="outline" size="sm">Minify</Button>
        <Button onClick={() => { setInput(""); setOutput(""); setError("") }} variant="ghost" size="sm">Clear</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Input</label>
            {input && <CopyButton text={input} />}
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your SQL here..."
            className="w-full min-h-[300px] sm:min-h-[400px] p-4 rounded-lg border border-border bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y font-mono text-sm"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Output</label>
            {output && <CopyButton text={output} />}
          </div>
          <textarea
            readOnly
            value={output}
            className="w-full min-h-[300px] sm:min-h-[400px] p-4 rounded-lg border border-border bg-muted/30 text-foreground resize-y font-mono text-sm"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  )
}