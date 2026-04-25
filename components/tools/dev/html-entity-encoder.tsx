"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import CopyButton from "@/components/tools/shared/copy-button"

const htmlEntities: Record<string, string> = {
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}

function encodeEntities(text: string): string {
  return text.replace(/[&<>"']/g, (c) => htmlEntities[c] || c)
}

function decodeEntities(text: string): string {
  const el = document.createElement("textarea")
  el.innerHTML = text
  return el.value
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

export default function HtmlEntityEncoder() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Input</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text with HTML entities or special characters..."
          className="w-full min-h-[150px] p-4 rounded-lg border border-border bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y font-mono text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setOutput(encodeEntities(input))} size="sm">Encode Entities</Button>
        <Button onClick={() => setOutput(decodeEntities(input))} variant="outline" size="sm">Decode Entities</Button>
        <Button onClick={() => setOutput(escapeHtml(input))} variant="outline" size="sm">Escape HTML</Button>
        <Button onClick={() => { setInput(""); setOutput(""); }} variant="ghost" size="sm">Clear</Button>
      </div>

      {output && (
        <div className="relative">
          <label className="text-sm font-medium text-foreground block mb-2">Output</label>
          <textarea
            readOnly
            value={output}
            className="w-full min-h-[150px] p-4 rounded-lg border border-border bg-muted/30 text-foreground resize-y font-mono text-sm"
          />
          <div className="absolute top-8 right-2"><CopyButton text={output} /></div>
        </div>
      )}
    </div>
  )
}