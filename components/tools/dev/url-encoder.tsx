"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import CopyButton from "@/components/tools/shared/copy-button"

export default function UrlEncoder() {
  const [input, setInput] = useState("")
  const [encoded, setEncoded] = useState("")
  const [decoded, setDecoded] = useState("")

  const handleEncode = () => {
    setEncoded(encodeURIComponent(input))
  }

  const handleDecode = () => {
    try {
      setDecoded(decodeURIComponent(input))
    } catch {
      setDecoded("Invalid encoded string")
    }
  }

  const parseUrl = (url: string) => {
    try {
      const u = new URL(url.startsWith("http") ? url : `https://${url}`)
      return {
        protocol: u.protocol,
        host: u.host,
        hostname: u.hostname,
        port: u.port || "(default)",
        pathname: u.pathname,
        search: u.search || "(none)",
        hash: u.hash || "(none)",
        origin: u.origin,
      }
    } catch {
      return null
    }
  }

  const parsed = input ? parseUrl(input) : null

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Input</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a URL or text..."
          className="w-full min-h-[100px] p-4 rounded-lg border border-border bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y font-mono text-sm"
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleEncode} size="sm">Encode</Button>
        <Button onClick={handleDecode} variant="outline" size="sm">Decode</Button>
        <Button onClick={() => { setInput(""); setEncoded(""); setDecoded(""); }} variant="ghost" size="sm">Clear</Button>
      </div>

      {encoded && (
        <div className="bg-muted/30 border border-border/50 rounded-lg p-3 relative">
          <p className="text-xs text-muted-foreground mb-1">Encoded</p>
          <p className="font-mono text-sm text-foreground break-all">{encoded}</p>
          <div className="absolute top-2 right-2"><CopyButton text={encoded} /></div>
        </div>
      )}

      {decoded && (
        <div className="bg-muted/30 border border-border/50 rounded-lg p-3 relative">
          <p className="text-xs text-muted-foreground mb-1">Decoded</p>
          <p className="font-mono text-sm text-foreground break-all">{decoded}</p>
          <div className="absolute top-2 right-2"><CopyButton text={decoded} /></div>
        </div>
      )}

      {parsed && (
        <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-foreground mb-3">URL Parts</h3>
          <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
            {Object.entries(parsed).map(([key, val]) => (
              <><span className="text-muted-foreground">{key}:</span><span className="font-mono text-foreground break-all">{val}</span></>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}