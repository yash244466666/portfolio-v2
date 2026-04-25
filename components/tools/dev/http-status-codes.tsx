"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import TabSwitcher from "@/components/tools/shared/tab-switcher"
import { httpStatusCodes } from "@/lib/tools/http-status-data"

const categoryTabs = [
  { id: "all", label: "All" },
  { id: "1xx", label: "1xx" },
  { id: "2xx", label: "2xx" },
  { id: "3xx", label: "3xx" },
  { id: "4xx", label: "4xx" },
  { id: "5xx", label: "5xx" },
]

const categoryColors: Record<string, string> = {
  "1xx": "border-blue-500/50 bg-blue-500/10 text-blue-400",
  "2xx": "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
  "3xx": "border-amber-500/50 bg-amber-500/10 text-amber-400",
  "4xx": "border-orange-500/50 bg-orange-500/10 text-orange-400",
  "5xx": "border-red-500/50 bg-red-500/10 text-red-400",
}

const categoryBadgeColors: Record<string, string> = {
  "1xx": "bg-blue-500/20 text-blue-400",
  "2xx": "bg-emerald-500/20 text-emerald-400",
  "3xx": "bg-amber-500/20 text-amber-400",
  "4xx": "bg-orange-500/20 text-orange-400",
  "5xx": "bg-red-500/20 text-red-400",
}

export default function HttpStatusCodes() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")

  const filtered = useMemo(() => {
    return httpStatusCodes.filter((code) => {
      const matchesCategory = category === "all" || code.category === category
      const query = search.toLowerCase()
      const matchesSearch =
        !query ||
        code.code.toString().includes(query) ||
        code.name.toLowerCase().includes(query) ||
        code.description.toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
  }, [search, category])

  return (
    <div className="space-y-6">
      <Input
        placeholder="Search by code, name, or description..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-background/50"
      />

      <TabSwitcher tabs={categoryTabs} activeTab={category} onTabChange={setCategory} />

      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No status codes found.</p>
        ) : (
          filtered.map((code) => (
            <div
              key={code.code}
              className={`rounded-xl border p-4 ${categoryColors[code.category]}`}
            >
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl font-bold font-mono">{code.code}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryBadgeColors[code.category]}`}>
                  {code.category}
                </span>
                <span className="font-medium">{code.name}</span>
              </div>
              <p className="text-sm opacity-80">{code.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}