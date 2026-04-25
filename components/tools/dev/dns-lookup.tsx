"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import CopyButton from "@/components/tools/shared/copy-button"

const recordTypes = ["A", "AAAA", "MX", "TXT", "CNAME", "NS"] as const

interface DnsRecord {
  name: string
  type: number
  TTL: number
  data: string
}

export default function DnsLookup() {
  const [domain, setDomain] = useState("")
  const [recordType, setRecordType] = useState<string>("A")
  const [results, setResults] = useState<DnsRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLookup = useCallback(async () => {
    if (!domain.trim()) return
    setLoading(true)
    setError("")
    setResults([])

    try {
      const res = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${recordType}`,
        { headers: { accept: "application/dns-json" } }
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      const data = await res.json()

      if (data.Status !== 0) {
        const rcode: Record<number, string> = {
          0: "No Error", 1: "Form Error", 2: "Server Failure",
          3: "Non-Existent Domain", 4: "Not Implemented", 5: "Query Refused",
        }
        throw new Error(`DNS error: ${rcode[data.Status] || `RCODE ${data.Status}`}`)
      }

      if (!data.Answer || data.Answer.length === 0) {
        setError(`No ${recordType} records found for ${domain}`)
        return
      }

      setResults(data.Answer)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed")
    } finally {
      setLoading(false)
    }
  }, [domain, recordType])

  const copyText = results.map((r) => `${r.name}\t${r.type}\t${r.TTL}\t${r.data}`).join("\n")

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Enter domain name (e.g. example.com)"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLookup()}
          className="bg-background/50 flex-1"
        />
        <Button onClick={handleLookup} disabled={loading || !domain.trim()}>
          {loading ? "Looking up..." : "Lookup"}
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {recordTypes.map((type) => (
          <button
            key={type}
            onClick={() => setRecordType(type)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              recordType === type
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">
              {results.length} {recordType} record{results.length !== 1 ? "s" : ""} for {domain}
            </h3>
            <CopyButton text={copyText} />
          </div>
          <div className="overflow-x-auto rounded-lg border border-border/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border/50">
                  <th className="text-left p-3 text-muted-foreground font-medium">Name</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Type</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">TTL</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {results.map((record, i) => (
                  <tr key={i} className="border-b border-border/30 last:border-0">
                    <td className="p-3 font-mono text-xs text-foreground break-all">{record.name}</td>
                    <td className="p-3 font-mono text-xs text-foreground">{record.type}</td>
                    <td className="p-3 font-mono text-xs text-muted-foreground">{record.TTL}</td>
                    <td className="p-3 font-mono text-xs text-foreground break-all">{record.data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}