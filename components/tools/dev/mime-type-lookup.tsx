"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import TabSwitcher from "@/components/tools/shared/tab-switcher"
import CopyButton from "@/components/tools/shared/copy-button"
import { allMimeTypes } from "@/lib/tools/mime-types"

const tabs = [
  { id: "ext-to-mime", label: "Extension to MIME" },
  { id: "mime-to-ext", label: "MIME to Extension" },
]

export default function MimeTypeLookup() {
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState("ext-to-mime")

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim()
    if (!query) return allMimeTypes

    return allMimeTypes.filter((entry) => {
      if (tab === "ext-to-mime") {
        return entry.extension.toLowerCase().includes(query) || entry.description.toLowerCase().includes(query)
      } else {
        return entry.mimeType.toLowerCase().includes(query) || entry.description.toLowerCase().includes(query)
      }
    })
  }, [search, tab])

  return (
    <div className="space-y-6">
      <TabSwitcher tabs={tabs} activeTab={tab} onTabChange={setTab} />

      <Input
        placeholder={tab === "ext-to-mime" ? "Search by extension (e.g. .pdf, .jpg)..." : "Search by MIME type (e.g. image/png)..." }
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-background/50"
      />

      <div className="max-h-[500px] overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No matching MIME types found.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((entry, i) => (
              <div
                key={`${entry.mimeType}-${entry.extension}-${i}`}
                className="flex items-center justify-between bg-background/50 border border-border/50 rounded-lg p-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-sm font-mono text-foreground">{entry.extension}</code>
                    <span className="text-muted-foreground">{"\u2192"}</span>
                    <code className="text-sm font-mono text-primary">{entry.mimeType}</code>
                  </div>
                  <p className="text-xs text-muted-foreground">{entry.description}</p>
                </div>
                <div className="ml-2 flex-shrink-0">
                  <CopyButton text={tab === "ext-to-mime" ? entry.mimeType : entry.extension} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}