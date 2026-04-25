"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import TabSwitcher from "@/components/tools/shared/tab-switcher"
import { unicodeData, unicodeCategories } from "@/lib/tools/unicode-data"

const categoryTabs = [
  { id: "all", label: "All" },
  ...unicodeCategories.map((c) => ({ id: c, label: c })),
]

export default function UnicodeLookup() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [copied, setCopied] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return unicodeData.filter((entry) => {
      const matchesCategory = category === "all" || entry.category === category
      const query = search.toLowerCase()
      const matchesSearch =
        !query ||
        entry.char === query ||
        entry.name.toLowerCase().includes(query) ||
        entry.codePoint.toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
  }, [search, category])

  const handleCopy = (char: string, codePoint: string) => {
    navigator.clipboard.writeText(char).catch(() => {
      const textarea = document.createElement("textarea")
      textarea.value = char
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
    })
    setCopied(codePoint)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="space-y-6">
      <Input
        placeholder="Search by character, name, or code point (e.g. U+0041, infinity)..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-background/50"
      />

      <TabSwitcher tabs={categoryTabs} activeTab={category} onTabChange={setCategory} />

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No characters found.</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-[600px] overflow-y-auto pr-1">
          {filtered.map((entry) => (
            <button
              key={entry.codePoint}
              onClick={() => handleCopy(entry.char, entry.codePoint)}
              className="group relative flex flex-col items-center justify-center p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-muted/50 hover:border-primary/50 transition-all aspect-square"
              title={`${entry.name}\n${entry.codePoint}\nClick to copy`}
            >
              <span className="text-2xl mb-1">{entry.char}</span>
              <span className="text-[10px] text-muted-foreground truncate w-full text-center">{entry.codePoint}</span>
              {copied === entry.codePoint && (
                <span className="absolute -top-1 -right-1 text-[10px] bg-primary text-primary-foreground px-1 rounded">Copied!</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}