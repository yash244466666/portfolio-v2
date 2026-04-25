"use client"

import { useState, useCallback } from "react"
import { ToolResult } from "@/components/tools/shared/tool-result"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import CopyButton from "@/components/tools/shared/copy-button"

const algorithms = [
  { id: "SHA-256", label: "SHA-256" },
  { id: "SHA-384", label: "SHA-384" },
  { id: "SHA-512", label: "SHA-512" },
]

export default function HmacGenerator() {
  const [message, setMessage] = useState("")
  const [secret, setSecret] = useState("")
  const [algorithm, setAlgorithm] = useState("SHA-256")
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")

  const generate = useCallback(async () => {
    try {
      const encoder = new TextEncoder()
      const keyData = encoder.encode(secret)
      const key = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: algorithm },
        false,
        ["sign"]
      )
      const msgData = encoder.encode(message)
      const signature = await crypto.subtle.sign("HMAC", key, msgData)
      const hashArray = Array.from(new Uint8Array(signature))
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
      setOutput(hashHex)
      setError("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "HMAC generation failed")
      setOutput("")
    }
  }, [message, secret, algorithm])

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter message to HMAC..."
            className="w-full min-h-[120px] p-4 rounded-lg border border-border bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y font-mono text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Secret Key</label>
          <Input
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Enter secret key..."
            className="bg-background/50 font-mono"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Algorithm</label>
          <div className="flex gap-1">
            {algorithms.map((a) => (
              <button
                key={a.id}
                onClick={() => setAlgorithm(a.id)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  algorithm === a.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={generate} size="sm">Generate HMAC</Button>
        <Button onClick={() => { setMessage(""); setSecret(""); setOutput(""); setError("") }} variant="ghost" size="sm">Clear</Button>
      </div>

      {output && (
        <ToolResult className="    relative">
          <p className="text-xs text-muted-foreground mb-1">HMAC-{algorithm.replace("SHA-", "")}</p>
          <p className="text-sm font-mono text-foreground break-all">{output}</p>
          <div className="absolute top-3 right-3"><CopyButton text={output} /></div>
        </ToolResult>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  )
}