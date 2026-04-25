"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import CopyButton from "@/components/tools/shared/copy-button"

function countStats(text: string) {
  if (!text.trim()) {
    return { words: 0, characters: 0, charactersNoSpaces: 0, sentences: 0, paragraphs: 0, readingTime: "0 min" }
  }
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const characters = text.length
  const charactersNoSpaces = text.replace(/\s/g, "").length
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim()).length
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim()).length || (text.trim() ? 1 : 0)
  const minutes = Math.max(1, Math.ceil(words / 200))
  const readingTime = words < 200 ? "< 1 min" : `${minutes} min`

  return { words, characters, charactersNoSpaces, sentences, paragraphs, readingTime }
}

interface WordCounterProps {
  emphasizeChars?: boolean
}

export default function WordCounter({ emphasizeChars }: WordCounterProps) {
  const [text, setText] = useState("")

  const stats = useMemo(() => countStats(text), [text])

  const statCards = emphasizeChars
    ? [
        { label: "Characters", value: stats.characters },
        { label: "Without Spaces", value: stats.charactersNoSpaces },
        { label: "Words", value: stats.words },
        { label: "Sentences", value: stats.sentences },
        { label: "Paragraphs", value: stats.paragraphs },
        { label: "Reading Time", value: stats.readingTime },
      ]
    : [
        { label: "Words", value: stats.words },
        { label: "Characters", value: stats.characters },
        { label: "Without Spaces", value: stats.charactersNoSpaces },
        { label: "Sentences", value: stats.sentences },
        { label: "Paragraphs", value: stats.paragraphs },
        { label: "Reading Time", value: stats.readingTime },
      ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-muted/30 border border-border/50 rounded-lg p-3 text-center"
          >
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here..."
          className="w-full min-h-[200px] sm:min-h-[280px] p-4 rounded-lg border border-border bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
        />
        {text && <div className="absolute top-2 right-2"><CopyButton text={text} /></div>}
      </div>
    </div>
  )
}