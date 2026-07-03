"use client"

import { useState } from "react"
import { ToolResult } from "@/components/tools/shared/tool-result"
import { Input } from "@/components/ui/input"
import CopyButton from "@/components/tools/shared/copy-button"

function base64UrlDecode(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/")
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4)
  try {
    return decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
  } catch {
    return atob(padded)
  }
}

function decodeJwt(token: string) {
  const parts = token.split(".")
  if (parts.length !== 3) return null

  try {
    const header = JSON.parse(base64UrlDecode(parts[0]))
    const payload = JSON.parse(base64UrlDecode(parts[1]))
    const isExpired = payload.exp ? Date.now() / 1000 > payload.exp : null
    const issuedAt = payload.iat ? new Date(payload.iat * 1000).toLocaleString() : null
    const expiresAt = payload.exp ? new Date(payload.exp * 1000).toLocaleString() : null

    return { header, payload, signature: parts[2], isExpired, issuedAt, expiresAt }
  } catch {
    return null
  }
}

export default function JwtDecoder() {
  const [token, setToken] = useState("")

  const decoded = token ? decodeJwt(token) : null

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">JWT Token</label>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste your JWT token here..."
          className="w-full min-h-[100px] p-4 rounded-lg border border-border bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y font-mono text-sm break-all"
        />
      </div>

      {token && !decoded && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
          Invalid JWT format. A JWT must have 3 parts separated by dots.
        </div>
      )}

      {decoded && (
        <div className="space-y-4">
          {decoded.isExpired !== null && (
            <div className={`rounded-lg p-3 text-sm ${decoded.isExpired ? "bg-red-500/10 border border-red-500/30 text-red-400" : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"}`}>
              {decoded.isExpired ? "Token is EXPIRED" : "Token is VALID (not expired)"}
              {decoded.expiresAt && ` • Expires: ${decoded.expiresAt}`}
              {decoded.issuedAt && ` • Issued: ${decoded.issuedAt}`}
            </div>
          )}

          <ToolResult >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-foreground">Header</h3>
              <CopyButton text={JSON.stringify(decoded.header, null, 2)} />
            </div>
            <pre className="font-mono text-sm text-foreground overflow-x-auto">{JSON.stringify(decoded.header, null, 2)}</pre>
          </ToolResult>

          <ToolResult >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-foreground">Payload</h3>
              <CopyButton text={JSON.stringify(decoded.payload, null, 2)} />
            </div>
            <pre className="font-mono text-sm text-foreground overflow-x-auto">{JSON.stringify(decoded.payload, null, 2)}</pre>
          </ToolResult>

          <ToolResult >
            <h3 className="text-sm font-medium text-foreground mb-2">Signature</h3>
            <p className="font-mono text-sm text-muted-foreground break-all">{decoded.signature}</p>
            <p className="text-xs text-muted-foreground mt-2">Note: This tool only decodes JWTs. It cannot verify the signature.</p>
          </ToolResult>
        </div>
      )}
    </div>
  )
}