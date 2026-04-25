"use client"

import { useState, useMemo, useCallback } from "react"
import { ToolResult } from "@/components/tools/shared/tool-result"
import CopyButton from "@/components/tools/shared/copy-button"

interface SanitizerOption {
  id: string
  label: string
  pattern: RegExp
  replacement: string
}

const options: SanitizerOption[] = [
  {
    id: "emails",
    label: "Email Addresses",
    pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    replacement: "[EMAIL REDACTED]",
  },
  {
    id: "phones",
    label: "Phone Numbers",
    pattern: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    replacement: "[PHONE REDACTED]",
  },
  {
    id: "ips",
    label: "IP Addresses",
    pattern: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
    replacement: "[IP REDACTED]",
  },
  {
    id: "ssn",
    label: "SSN Patterns (XXX-XX-XXXX)",
    pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
    replacement: "[SSN REDACTED]",
  },
  {
    id: "creditCards",
    label: "Credit Card Patterns",
    pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
    replacement: "[CC REDACTED]",
  },
]

interface SanitizeResult {
  text: string
  counts: Record<string, number>
}

function sanitizeText(input: string, enabled: Record<string, boolean>): SanitizeResult {
  let result = input
  const counts: Record<string, number> = {}

  for (const option of options) {
    if (!enabled[option.id]) {
      counts[option.id] = 0
      continue
    }
    const matches = result.match(option.pattern)
    counts[option.id] = matches ? matches.length : 0
    result = result.replace(option.pattern, option.replacement)
  }

  return { text: result, counts }
}

export default function DataSanitizer() {
  const [input, setInput] = useState("")
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    emails: true,
    phones: true,
    ips: true,
    ssn: true,
    creditCards: true,
  })

  const toggleOption = useCallback((id: string) => {
    setEnabled((prev) => ({ ...prev, [id]: !prev[id] }))
  }, [])

  const result = useMemo(() => sanitizeText(input, enabled), [input, enabled])

  const totalRemoved = Object.values(result.counts).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">
      {/* Toggle options */}
      <ToolResult >
        <span className="text-sm font-medium text-foreground block mb-3">
          What to strip
        </span>
        <div className="space-y-2">
          {options.map((option) => (
            <label
              key={option.id}
              className="flex items-center gap-2 text-sm text-foreground cursor-pointer p-1.5 rounded-md hover:bg-muted/30"
            >
              <input
                type="checkbox"
                checked={enabled[option.id]}
                onChange={() => toggleOption(option.id)}
                className="rounded border-border accent-primary"
              />
              {option.label}
            </label>
          ))}
        </div>
      </ToolResult>

      {/* Input */}
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Input Text</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste text containing sensitive data to sanitize..."
          className="w-full min-h-[120px] p-4 rounded-lg border border-border bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y font-mono text-sm"
        />
      </div>

      {/* Output */}
      {input && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Sanitized Output</label>
            <CopyButton text={result.text} />
          </div>
          <ToolResult className="    min-h-[80px]">
            <p className="font-mono text-sm text-foreground whitespace-pre-wrap break-all">
              {result.text || <span className="text-muted-foreground italic">No output</span>}
            </p>
          </ToolResult>
        </div>
      )}

      {/* Counts */}
      {input && totalRemoved > 0 && (
        <ToolResult >
          <span className="text-sm font-medium text-foreground block mb-3">
            Items Removed
          </span>
          <div className="space-y-1.5">
            {options.map((option) => (
              <div
                key={option.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">{option.label}</span>
                <span className="text-foreground font-mono">
                  {enabled[option.id] ? result.counts[option.id] : "off"}
                </span>
              </div>
            ))}
            <div className="border-t border-border/50 pt-1.5 mt-1.5">
              <div className="flex items-center justify-between text-sm font-medium">
                <span className="text-foreground">Total</span>
                <span className="text-primary font-mono">{totalRemoved}</span>
              </div>
            </div>
          </div>
        </ToolResult>
      )}
    </div>
  )
}