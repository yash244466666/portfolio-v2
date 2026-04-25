"use client"

import { useState, useMemo, useCallback } from "react"
import { Input } from "@/components/ui/input"
import CopyButton from "@/components/tools/shared/copy-button"

const defaultMethods = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
const defaultHeaders = ["Content-Type", "Authorization", "X-Requested-With"]

export default function CorsHeaderBuilder() {
  const [allowOrigin, setAllowOrigin] = useState("*")
  const [allowMethods, setAllowMethods] = useState<Record<string, boolean>>({
    GET: true,
    POST: true,
    PUT: false,
    DELETE: false,
    PATCH: false,
    OPTIONS: true,
  })
  const [customMethods, setCustomMethods] = useState("")
  const [allowHeaders, setAllowHeaders] = useState<Record<string, boolean>>({
    "Content-Type": true,
    Authorization: true,
    "X-Requested-With": false,
  })
  const [customHeaders, setCustomHeaders] = useState("")
  const [maxAge, setMaxAge] = useState("86400")
  const [allowCredentials, setAllowCredentials] = useState(false)

  const toggleMethod = useCallback((method: string) => {
    setAllowMethods((prev) => ({ ...prev, [method]: !prev[method] }))
  }, [])

  const toggleHeader = useCallback((header: string) => {
    setAllowHeaders((prev) => ({ ...prev, [header]: !prev[header] }))
  }, [])

  const headers = useMemo(() => {
    const result: { key: string; value: string }[] = []

    const selectedMethods = [
      ...defaultMethods.filter((m) => allowMethods[m]),
      ...(customMethods
        ? customMethods.split(",").map((m) => m.trim()).filter(Boolean)
        : []),
    ].join(", ")

    const selectedHeaders = [
      ...defaultHeaders.filter((h) => allowHeaders[h]),
      ...(customHeaders
        ? customHeaders.split(",").map((h) => h.trim()).filter(Boolean)
        : []),
    ].join(", ")

    result.push({
      key: "Access-Control-Allow-Origin",
      value: allowOrigin || "*",
    })

    if (selectedMethods) {
      result.push({
        key: "Access-Control-Allow-Methods",
        value: selectedMethods,
      })
    }

    if (selectedHeaders) {
      result.push({
        key: "Access-Control-Allow-Headers",
        value: selectedHeaders,
      })
    }

    result.push({
      key: "Access-Control-Max-Age",
      value: maxAge || "0",
    })

    if (allowCredentials) {
      result.push({
        key: "Access-Control-Allow-Credentials",
        value: "true",
      })
    }

    return result
  }, [allowOrigin, allowMethods, customMethods, allowHeaders, customHeaders, maxAge, allowCredentials])

  const fullHeader = useMemo(() => {
    return headers.map((h) => `${h.key}: ${h.value}`).join("\n")
  }, [headers])

  return (
    <div className="space-y-6">
      {/* Allowed Origins */}
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">
          Allowed Origins
        </label>
        <Input
          value={allowOrigin}
          onChange={(e) => setAllowOrigin(e.target.value)}
          placeholder="e.g. * or https://example.com"
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Use * for all origins, or specify specific domains
        </p>
      </div>

      {/* Methods */}
      <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
        <span className="text-sm font-medium text-foreground block mb-3">
          Allowed Methods
        </span>
        <div className="flex flex-wrap gap-2 mb-3">
          {defaultMethods.map((method) => (
            <button
              key={method}
              onClick={() => toggleMethod(method)}
              className={`px-3 py-1.5 text-xs font-mono rounded-md border transition-colors ${
                allowMethods[method]
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {method}
            </button>
          ))}
        </div>
        <Input
          value={customMethods}
          onChange={(e) => setCustomMethods(e.target.value)}
          placeholder="Custom methods (comma separated)"
          className="font-mono text-sm"
        />
      </div>

      {/* Headers */}
      <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
        <span className="text-sm font-medium text-foreground block mb-3">
          Allowed Headers
        </span>
        <div className="flex flex-wrap gap-2 mb-3">
          {defaultHeaders.map((header) => (
            <button
              key={header}
              onClick={() => toggleHeader(header)}
              className={`px-3 py-1.5 text-xs font-mono rounded-md border transition-colors ${
                allowHeaders[header]
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {header}
            </button>
          ))}
        </div>
        <Input
          value={customHeaders}
          onChange={(e) => setCustomHeaders(e.target.value)}
          placeholder="Custom headers (comma separated)"
          className="font-mono text-sm"
        />
      </div>

      {/* Max Age & Credentials */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">
            Max Age (seconds)
          </label>
          <Input
            type="number"
            value={maxAge}
            onChange={(e) => setMaxAge(e.target.value)}
            placeholder="86400"
            className="font-mono text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">
            Allow Credentials
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer p-2.5 rounded-md hover:bg-muted/30 border border-border/50 h-[42px]">
            <input
              type="checkbox"
              checked={allowCredentials}
              onChange={(e) => setAllowCredentials(e.target.checked)}
              className="rounded border-border accent-primary"
            />
            Enable
          </label>
        </div>
      </div>

      {/* Generated headers */}
      <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-foreground">
            Generated Headers
          </span>
          <CopyButton text={fullHeader} />
        </div>
        <div className="space-y-1.5">
          {headers.map((h, i) => (
            <div key={i} className="font-mono text-sm">
              <span className="text-primary">{h.key}</span>
              <span className="text-muted-foreground">: </span>
              <span className="text-foreground">{h.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}