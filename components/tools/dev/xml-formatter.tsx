"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import CopyButton from "@/components/tools/shared/copy-button"

export default function XmlFormatter() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")

  const formatXml = (xml: string): string => {
    let formatted = ""
    let indent = 0
    const tab = "  "
    const lines = xml.replace(/></g, ">\n<").split("\n")

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      if (trimmed.startsWith("</")) {
        indent = Math.max(0, indent - 1)
      }

      formatted += tab.repeat(indent) + trimmed + "\n"

      if (
        trimmed.startsWith("<") &&
        !trimmed.startsWith("</") &&
        !trimmed.startsWith("<?") &&
        !trimmed.startsWith("<!") &&
        !trimmed.endsWith("/>") &&
        !trimmed.includes("</")
      ) {
        indent++
      }
    }

    return formatted.trim()
  }

  const handleFormat = () => {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(input, "text/xml")
      const parseError = doc.querySelector("parsererror")
      if (parseError) {
        setError("Invalid XML: " + parseError.textContent?.substring(0, 200))
        setOutput("")
        return
      }
      setOutput(formatXml(input))
      setError("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to format XML")
      setOutput("")
    }
  }

  const handleMinify = () => {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(input, "text/xml")
      const parseError = doc.querySelector("parsererror")
      if (parseError) {
        setError("Invalid XML: " + parseError.textContent?.substring(0, 200))
        setOutput("")
        return
      }
      setOutput(input.replace(/>\s+</g, "><").replace(/\s+/g, " ").trim())
      setError("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to minify XML")
      setOutput("")
    }
  }

  const handleValidate = () => {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(input, "text/xml")
      const parseError = doc.querySelector("parsererror")
      if (parseError) {
        setError("Invalid XML: " + parseError.textContent?.substring(0, 200))
        setOutput("")
      } else {
        setError("")
        setOutput("Valid XML")
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Validation failed")
      setOutput("")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleFormat} size="sm">Format</Button>
        <Button onClick={handleMinify} variant="outline" size="sm">Minify</Button>
        <Button onClick={handleValidate} variant="outline" size="sm">Validate</Button>
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
            placeholder="Paste your XML here..."
            className="w-full min-h-[300px] sm:min-h-[400px] p-4 rounded-lg border border-border bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y font-mono text-sm"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Output</label>
            {output && output !== "Valid XML" && <CopyButton text={output} />}
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