"use client"

import { useState, useCallback } from "react"
import { ToolResult } from "@/components/tools/shared/tool-result"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

async function computeHash(algo: string, text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest(algo, data)
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("")
}

export default function HashDiff() {
  const [text1, setText1] = useState("")
  const [text2, setText2] = useState("")
  const [results, setResults] = useState<{ algo: string; hash1: string; hash2: string; match: boolean }[]>([])
  const [loading, setLoading] = useState(false)

  const compare = useCallback(async () => {
    if (!text1 || !text2) return
    setLoading(true)
    const algos = ["SHA-1", "SHA-256", "SHA-512"]
    const out = []
    for (const algo of algos) {
      const [h1, h2] = await Promise.all([computeHash(algo, text1), computeHash(algo, text2)])
      out.push({ algo, hash1: h1, hash2: h2, match: h1 === h2 })
    }
    setResults(out)
    setLoading(false)
  }, [text1, text2])

  const allMatch = results.length > 0 && results.every((r) => r.match)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Text 1</label>
          <textarea
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            placeholder="Enter first text..."
            className="w-full min-h-[150px] p-4 rounded-lg border border-border bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y font-mono text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Text 2</label>
          <textarea
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            placeholder="Enter second text..."
            className="w-full min-h-[150px] p-4 rounded-lg border border-border bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y font-mono text-sm"
          />
        </div>
      </div>

      <Button onClick={compare} disabled={loading || !text1 || !text2} className="w-full">
        {loading ? "Computing..." : "Compare Hashes"}
      </Button>

      {results.length > 0 && (
        <div className={`rounded-lg p-4 text-center text-sm font-medium ${allMatch ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border border-red-500/30 text-red-400"}`}>
          {allMatch ? "Texts are IDENTICAL" : "Texts are DIFFERENT"}
        </div>
      )}

      {results.map((r) => (
        <ToolResult key={r.algo} className="    space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{r.algo}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${r.match ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
              {r.match ? "Match" : "Different"}
            </span>
          </div>
          <div className="grid grid-cols-[60px_1fr] gap-1 text-xs font-mono">
            <span className="text-muted-foreground">Text 1:</span><span className="text-foreground break-all">{r.hash1}</span>
            <span className="text-muted-foreground">Text 2:</span><span className="text-foreground break-all">{r.hash2}</span>
          </div>
        </ToolResult>
      ))}
    </div>
  )
}