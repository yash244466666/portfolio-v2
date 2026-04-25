"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import TabSwitcher from "@/components/tools/shared/tab-switcher"
import CopyButton from "@/components/tools/shared/copy-button"

const tabs = [
  { id: "csv-json", label: "CSV to JSON" },
  { id: "json-csv", label: "JSON to CSV" },
]

const delimiters = [
  { id: ",", label: "Comma" },
  { id: ";", label: "Semicolon" },
  { id: "\t", label: "Tab" },
]

export default function CsvJsonConverter() {
  const [activeTab, setActiveTab] = useState("csv-json")
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")
  const [delimiter, setDelimiter] = useState(",")
  const [hasHeader, setHasHeader] = useState(true)

  const parseCSVLine = (line: string, delim: string): string[] => {
    const result: string[] = []
    let current = ""
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === delim && !inQuotes) {
        result.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  }

  const csvToJson = useCallback(() => {
    try {
      const lines = input.split("\n").filter((l) => l.trim())
      if (lines.length === 0) {
        setError("No input provided")
        setOutput("")
        return
      }
      const headers = hasHeader
        ? parseCSVLine(lines[0], delimiter)
        : parseCSVLine(lines[0], delimiter).map((_, i) => `column${i + 1}`)
      const startIndex = hasHeader ? 1 : 0
      const result = lines.slice(startIndex).map((line) => {
        const values = parseCSVLine(line, delimiter)
        const obj: Record<string, string> = {}
        headers.forEach((header, i) => {
          obj[header] = values[i] || ""
        })
        return obj
      })
      setOutput(JSON.stringify(result, null, 2))
      setError("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to convert CSV to JSON")
      setOutput("")
    }
  }, [input, delimiter, hasHeader])

  const jsonToCsv = useCallback(() => {
    try {
      const parsed = JSON.parse(input)
      const arr = Array.isArray(parsed) ? parsed : [parsed]
      if (arr.length === 0) {
        setError("Empty array")
        setOutput("")
        return
      }
      const allKeys = new Set<string>()
      arr.forEach((item: Record<string, unknown>) => {
        Object.keys(item).forEach((key) => allKeys.add(key))
      })
      const headers = Array.from(allKeys)
      const escapeCsv = (val: unknown): string => {
        const str = String(val ?? "")
        if (str.includes(delimiter) || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      }
      const lines = [headers.map(escapeCsv).join(delimiter)]
      arr.forEach((item: Record<string, unknown>) => {
        lines.push(headers.map((h) => escapeCsv(item[h])).join(delimiter))
      })
      setOutput(lines.join("\n"))
      setError("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to convert JSON to CSV")
      setOutput("")
    }
  }, [input, delimiter])

  const handleConvert = () => {
    if (activeTab === "csv-json") csvToJson()
    else jsonToCsv()
  }

  return (
    <div className="space-y-6">
      <TabSwitcher tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">Delimiter:</label>
          <div className="flex gap-1">
            {delimiters.map((d) => (
              <button
                key={d.id}
                onClick={() => setDelimiter(d.id)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  delimiter === d.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={hasHeader}
            onChange={(e) => setHasHeader(e.target.checked)}
            className="rounded border-border accent-primary"
          />
          First row is header
        </label>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleConvert} size="sm">Convert</Button>
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
            placeholder={activeTab === "csv-json" ? "Paste CSV here..." : "Paste JSON here..."}
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