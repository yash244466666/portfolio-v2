"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { emojiCategories, allEmojis } from "@/lib/tools/emoji-data"

export default function EmojiPicker() {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [copied, setCopied] = useState("")

  const filteredCategories = useMemo(() => {
    if (!search) return activeCategory ? emojiCategories.filter((c) => c.name === activeCategory) : emojiCategories
    const q = search.toLowerCase()
    return emojiCategories.map((cat) => ({
      ...cat,
      emojis: cat.emojis.filter(
        (e) => e.name.includes(q) || e.emoji.includes(q)
      ),
    })).filter((c) => c.emojis.length > 0)
  }, [search, activeCategory])

  const copyEmoji = (emoji: string) => {
    navigator.clipboard.writeText(emoji)
    setCopied(emoji)
    setTimeout(() => setCopied(""), 1500)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search emojis..."
            className="bg-background/50 pl-3"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-2.5 py-1 rounded-full text-xs transition-colors ${!activeCategory ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            All
          </button>
          {emojiCategories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-2.5 py-1 rounded-full text-xs transition-colors ${activeCategory === cat.name ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {copied && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2 text-sm text-emerald-400 text-center">
          Copied {copied}
        </div>
      )}

      <div className="space-y-6">
        {filteredCategories.map((cat) => (
          <div key={cat.name}>
            <h3 className="text-sm font-medium text-foreground mb-2">{cat.name}</h3>
            <div className="flex flex-wrap gap-1.5">
              {cat.emojis.map((e) => (
                <button
                  key={e.name}
                  onClick={() => copyEmoji(e.emoji)}
                  className="w-10 h-10 flex items-center justify-center text-xl hover:bg-muted/50 rounded-lg transition-colors"
                  title={e.name}
                >
                  {e.emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
        {filteredCategories.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No emojis found for &quot;{search}&quot;</p>
        )}
      </div>
    </div>
  )
}