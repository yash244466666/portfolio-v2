"use client"

import { useState, useMemo, useCallback } from "react"
import TabSwitcher from "@/components/tools/shared/tab-switcher"
import { Input } from "@/components/ui/input"

const tabs = [
  { id: "to-roman", label: "Arabic to Roman" },
  { id: "to-arabic", label: "Roman to Arabic" },
]

const romanNumerals: [number, string][] = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
]

function toRoman(num: number): string {
  if (num < 1 || num > 3999 || !Number.isInteger(num)) return "Invalid (1-3999)"
  let result = ""
  for (const [value, symbol] of romanNumerals) {
    while (num >= value) {
      result += symbol
      num -= value
    }
  }
  return result
}

function fromRoman(roman: string): number | null {
  const map: Record<string, number> = {
    I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000,
  }

  const upper = roman.toUpperCase().trim()
  if (!/^[IVXLCDM]+$/.test(upper)) return null

  let total = 0
  for (let i = 0; i < upper.length; i++) {
    const current = map[upper[i]]
    const next = map[upper[i + 1]]

    if (next && current < next) {
      total -= current
    } else {
      total += current
    }
  }

  // Validate by converting back
  if (toRoman(total) !== upper) return null

  return total
}

interface HistoryEntry {
  id: string
  arabic: number
  roman: string
  direction: string
}

export default function RomanNumeralConverter() {
  const [activeTab, setActiveTab] = useState("to-roman")
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<HistoryEntry[]>([])

  const result = useMemo(() => {
    if (!input.trim()) return null

    if (activeTab === "to-roman") {
      const num = parseInt(input, 10)
      if (isNaN(num) || num < 1 || num > 3999) return null
      const roman = toRoman(num)
      return { arabic: num, roman, direction: "Arabic to Roman" }
    } else {
      const num = fromRoman(input)
      if (num === null) return null
      return { arabic: num, roman: input.toUpperCase(), direction: "Roman to Arabic" }
    }
  }, [input, activeTab])

  const handleConvert = useCallback(() => {
    if (!result) return
    const entry: HistoryEntry = {
      id: Date.now().toString(),
      arabic: result.arabic,
      roman: result.roman,
      direction: result.direction,
    }
    setHistory((prev) => [entry, ...prev].slice(0, 20))
  }, [result])

  // Auto-add to history when result changes
  useMemo(() => {
    if (result) {
      handleConvert()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result?.arabic, result?.roman])

  const isValid = useMemo(() => {
    if (!input.trim()) return null
    if (activeTab === "to-roman") {
      const num = parseInt(input, 10)
      return !isNaN(num) && num >= 1 && num <= 3999
    }
    return fromRoman(input) !== null
  }, [input, activeTab])

  return (
    <div className="space-y-6">
      <TabSwitcher tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div>
        <label className="text-sm font-medium text-foreground block mb-2">
          {activeTab === "to-roman" ? "Arabic Number (1-3999)" : "Roman Numeral"}
        </label>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={activeTab === "to-roman" ? "e.g. 42" : "e.g. XLII"}
          className="font-mono text-lg"
        />
        {input && isValid === false && (
          <p className="text-xs text-red-400 mt-1">
            {activeTab === "to-roman"
              ? "Enter a valid number between 1 and 3999"
              : "Enter a valid Roman numeral (I, V, X, L, C, D, M)"}
          </p>
        )}
      </div>

      {result && isValid && (
        <div className="bg-muted/30 border border-border/50 rounded-xl p-6 text-center">
          <p className="text-xs text-muted-foreground mb-2">{result.direction}</p>
          {activeTab === "to-roman" ? (
            <p className="text-4xl font-mono text-foreground tracking-wider">{result.roman}</p>
          ) : (
            <p className="text-4xl font-mono text-foreground">{result.arabic}</p>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">History</span>
            <button
              onClick={() => setHistory([])}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="space-y-1.5">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between text-sm py-1"
              >
                <span className="font-mono text-foreground">{entry.arabic}</span>
                <span className="text-muted-foreground">=</span>
                <span className="font-mono text-foreground">{entry.roman}</span>
                <span className="text-xs text-muted-foreground ml-auto">{entry.direction}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}