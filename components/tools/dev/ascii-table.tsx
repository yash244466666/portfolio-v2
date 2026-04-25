"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { asciiData } from "@/lib/tools/ascii-data"

export default function AsciiTable() {
  const [search, setSearch] = useState("")
  const [copied, setCopied] = useState<number | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return asciiData
    const q = search.toLowerCase()
    return asciiData.filter((entry) => {
      const hex = entry.dec.toString(16).toUpperCase()
      const oct = entry.dec.toString(8)
      return (
        entry.dec.toString().includes(q) ||
        hex.toLowerCase().includes(q) ||
        oct.includes(q) ||
        entry.char.toLowerCase().includes(q) ||
        entry.description.toLowerCase().includes(q)
      )
    })
  }, [search])

  const handleCopy = (char: string, dec: number) => {
    const text = dec < 32 || dec === 127 ? String.fromCharCode(dec) : char
    navigator.clipboard.writeText(text).catch(() => {
      const textarea = document.createElement("textarea")
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
    })
    setCopied(dec)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="space-y-6">
      <Input
        placeholder="Search by decimal, hex, octal, character, or description..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-background/50"
      />

      <div className="overflow-x-auto rounded-lg border border-border/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border/50">
              <th className="text-left p-3 text-muted-foreground font-medium">Dec</th>
              <th className="text-left p-3 text-muted-foreground font-medium">Hex</th>
              <th className="text-left p-3 text-muted-foreground font-medium">Oct</th>
              <th className="text-left p-3 text-muted-foreground font-medium">Char</th>
              <th className="text-left p-3 text-muted-foreground font-medium">Description</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => {
              const isControl = entry.dec < 32 || entry.dec === 127
              return (
                <tr
                  key={entry.dec}
                  className="border-b border-border/30 last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => handleCopy(entry.char, entry.dec)}
                >
                  <td className="p-3 font-mono text-foreground">{entry.dec}</td>
                  <td className="p-3 font-mono text-foreground">{entry.dec.toString(16).toUpperCase().padStart(2, "0")}</td>
                  <td className="p-3 font-mono text-foreground">{entry.dec.toString(8).padStart(3, "0")}</td>
                  <td className="p-3 font-mono text-foreground">
                    {isControl ? (
                      <span className="text-muted-foreground text-xs">{entry.char}</span>
                    ) : (
                      <span className="text-primary font-bold text-base">{entry.char}</span>
                    )}
                  </td>
                  <td className="p-3 text-muted-foreground">{entry.description}</td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {copied === entry.dec ? "Copied!" : "Click to copy"}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <p className="text-muted-foreground text-center py-4">No matching characters found.</p>
      )}
    </div>
  )
}