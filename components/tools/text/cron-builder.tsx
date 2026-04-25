"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cronFieldNames, cronFieldRanges, dayOfWeekNames, monthNames, parseCron, describeCron } from "@/lib/tools/cron-utils"

const presets = [
  { label: "Every minute", value: "* * * * *" },
  { label: "Every hour", value: "0 * * * *" },
  { label: "Daily at midnight", value: "0 0 * * *" },
  { label: "Weekdays at 9am", value: "0 9 * * 1-5" },
  { label: "Every Sunday at noon", value: "0 12 * * 0" },
  { label: "Every 15 minutes", value: "*/15 * * * *" },
  { label: "First of every month", value: "0 0 1 * *" },
  { label: "Every 6 hours", value: "0 */6 * * *" },
]

export default function CronBuilder() {
  const [expression, setExpression] = useState("0 9 * * 1-5")
  const [fields, setFields] = useState(["0", "9", "*", "*", "1-5"])

  const parsed = useMemo(() => parseCron(expression), [expression])
  const description = useMemo(() => parsed ? describeCron(parsed) : "Invalid expression", [parsed])

  const updateField = (index: number, value: string) => {
    const newFields = [...fields]
    newFields[index] = value
    setFields(newFields)
    setExpression(newFields.join(" "))
  }

  const applyPreset = (value: string) => {
    setExpression(value)
    setFields(value.split(" "))
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Cron Expression</label>
        <Input
          type="text"
          value={expression}
          onChange={(e) => {
            setExpression(e.target.value)
            const parts = e.target.value.trim().split(/\s+/)
            if (parts.length === 5) setFields(parts)
          }}
          placeholder="* * * * *"
          className="bg-background/50 font-mono text-lg"
        />
      </div>

      {parsed && (
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
          <p className="text-sm font-medium text-foreground">{description}</p>
        </div>
      )}

      {!parsed && expression && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
          Invalid expression. Must have 5 fields separated by spaces.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {cronFieldNames.map((name, i) => (
          <div key={name}>
            <label className="text-xs text-muted-foreground block mb-1">{name}</label>
            <Input
              type="text"
              value={fields[i] || ""}
              onChange={(e) => updateField(i, e.target.value)}
              placeholder={`${cronFieldRanges[i].min}-${cronFieldRanges[i].max}`}
              className="bg-background/50 font-mono text-sm"
            />
          </div>
        ))}
      </div>

      <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-foreground mb-2">Quick Reference</h3>
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <span><code className="text-foreground">*</code> — Any value</span>
          <span><code className="text-foreground">,</code> — List separator</span>
          <span><code className="text-foreground">-</code> — Range</span>
          <span><code className="text-foreground">/</code> — Step values</span>
        </div>
        <div className="mt-3 text-xs">
          <p className="text-muted-foreground mb-1">Days of week:</p>
          <p className="text-foreground">{dayOfWeekNames.map((d, i) => `${i}=${d}`).join(", ")}</p>
          <p className="text-muted-foreground mb-1 mt-2">Months:</p>
          <p className="text-foreground">{monthNames.filter(Boolean).map((m, i) => `${i + 1}=${m}`).join(", ")}</p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Common Presets</h3>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p.value)}
              className={`px-3 py-1.5 rounded-md text-xs transition-colors ${expression === p.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}