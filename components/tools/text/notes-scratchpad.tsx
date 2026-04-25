"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import CopyButton from "@/components/tools/shared/copy-button"

const STORAGE_KEY = "portfolio:scratchpad"

export default function NotesScratchpad() {
  const [text, setText] = useState("")
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        setText(data.text || "")
        if (data.lastSaved) {
          setLastSaved(new Date(data.lastSaved))
        }
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  const saveToStorage = useCallback((value: string) => {
    const now = new Date()
    setLastSaved(now)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ text: value, lastSaved: now.toISOString() }))
  }, [])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setText(value)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      saveToStorage(value)
    }, 500)
  }, [saveToStorage])

  const handleClear = useCallback(() => {
    if (showClearConfirm) {
      setText("")
      saveToStorage("")
      setShowClearConfirm(false)
    } else {
      setShowClearConfirm(true)
      setTimeout(() => setShowClearConfirm(false), 3000)
    }
  }, [showClearConfirm, saveToStorage])

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  const wordCount = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0
  const charCount = text.length

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center">
        <span className="text-sm text-muted-foreground">
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </span>
        <span className="text-sm text-muted-foreground">
          {charCount} {charCount === 1 ? "character" : "characters"}
        </span>
        {lastSaved && (
          <span className="text-sm text-muted-foreground">
            Last saved: {lastSaved.toLocaleTimeString()}
          </span>
        )}
        <div className="ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className={showClearConfirm ? "border-red-500/50 text-red-400 hover:bg-red-500/10" : ""}
          >
            {showClearConfirm ? "Confirm Clear" : "Clear"}
          </Button>
        </div>
      </div>

      <div className="relative">
        <textarea
          value={text}
          onChange={handleChange}
          placeholder="Start typing your notes... Everything is auto-saved to your browser."
          className="w-full min-h-[300px] sm:min-h-[400px] p-4 rounded-lg border border-border bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
        />
        {text && <div className="absolute top-2 right-2"><CopyButton text={text} /></div>}
      </div>
    </div>
  )
}