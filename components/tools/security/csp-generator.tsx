"use client"

import { useState, useMemo, useCallback } from "react"
import { Input } from "@/components/ui/input"
import CopyButton from "@/components/tools/shared/copy-button"

interface CspDirective {
  id: string
  label: string
  description: string
  enabled: boolean
  sources: string
}

const defaultDirectives: CspDirective[] = [
  { id: "default-src", label: "default-src", description: "Fallback for other directives", enabled: true, sources: "'self'" },
  { id: "script-src", label: "script-src", description: "JavaScript sources", enabled: false, sources: "" },
  { id: "style-src", label: "style-src", description: "CSS sources", enabled: false, sources: "" },
  { id: "img-src", label: "img-src", description: "Image sources", enabled: false, sources: "" },
  { id: "font-src", label: "font-src", description: "Font sources", enabled: false, sources: "" },
  { id: "connect-src", label: "connect-src", description: "Fetch, XHR, WebSocket sources", enabled: false, sources: "" },
  { id: "media-src", label: "media-src", description: "Audio & video sources", enabled: false, sources: "" },
  { id: "object-src", label: "object-src", description: "Object & embed sources", enabled: false, sources: "'none'" },
  { id: "frame-src", label: "frame-src", description: "Iframe sources", enabled: false, sources: "" },
  { id: "base-uri", label: "base-uri", description: "Restrict <base> element", enabled: false, sources: "'self'" },
  { id: "form-action", label: "form-action", description: "Form submission targets", enabled: false, sources: "'self'" },
  { id: "frame-ancestors", label: "frame-ancestors", description: "Who can embed this page", enabled: false, sources: "'none'" },
  { id: "upgrade-insecure-requests", label: "upgrade-insecure-requests", description: "Upgrade HTTP to HTTPS", enabled: false, sources: "" },
]

const commonSources = ["'self'", "'none'", "'unsafe-inline'", "'unsafe-eval'", "*"]

export default function CspGenerator() {
  const [directives, setDirectives] = useState<CspDirective[]>(
    defaultDirectives.map((d) => ({ ...d }))
  )

  const toggleDirective = useCallback((id: string) => {
    setDirectives((prev) =>
      prev.map((d) => (d.id === id ? { ...d, enabled: !d.enabled } : d))
    )
  }, [])

  const updateSources = useCallback((id: string, sources: string) => {
    setDirectives((prev) =>
      prev.map((d) => (d.id === id ? { ...d, sources } : d))
    )
  }, [])

  const addSourceTag = useCallback((id: string, tag: string) => {
    setDirectives((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d
        const current = d.sources ? d.sources.split(" ").filter(Boolean) : []
        if (current.includes(tag)) return d
        return { ...d, sources: [...current, tag].join(" ") }
      })
    )
  }, [])

  const cspHeader = useMemo(() => {
    const parts = directives
      .filter((d) => d.enabled)
      .map((d) => {
        if (d.id === "upgrade-insecure-requests") return d.id
        return `${d.id} ${d.sources || "'none'"}`
      })
    return parts.join("; ")
  }, [directives])

  return (
    <div className="space-y-6">
      {/* Directives */}
      <div className="space-y-2">
        {directives.map((directive) => (
          <div
            key={directive.id}
            className="bg-muted/30 border border-border/50 rounded-lg p-3"
          >
            <div className="flex items-center gap-3 mb-1">
              <input
                type="checkbox"
                checked={directive.enabled}
                onChange={() => toggleDirective(directive.id)}
                className="rounded border-border accent-primary"
              />
              <div className="flex-1">
                <span className="text-sm font-mono font-medium text-foreground">
                  {directive.label}
                </span>
                <p className="text-xs text-muted-foreground">{directive.description}</p>
              </div>
            </div>

            {directive.enabled && directive.id !== "upgrade-insecure-requests" && (
              <div className="mt-2 ml-6">
                <Input
                  value={directive.sources}
                  onChange={(e) => updateSources(directive.id, e.target.value)}
                  placeholder="e.g. 'self' https://cdn.example.com"
                  className="font-mono text-sm"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {commonSources.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => addSourceTag(directive.id, tag)}
                      className="px-2 py-0.5 text-xs rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-mono"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Generated header */}
      <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            Content-Security-Policy
          </span>
          <CopyButton text={cspHeader} />
        </div>
        <p className="font-mono text-sm text-muted-foreground break-all">
          {cspHeader || "Enable directives above to generate CSP"}
        </p>
      </div>
    </div>
  )
}