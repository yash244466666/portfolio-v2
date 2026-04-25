"use client"

import { useState, useMemo, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { unitCategories, unitData, convertUnit, type UnitCategory } from "@/lib/tools/unit-data"

export default function UnitConverter() {
  const [category, setCategory] = useState<UnitCategory>("length")
  const [fromValue, setFromValue] = useState("1")
  const [fromUnit, setFromUnit] = useState("")
  const [toUnit, setToUnit] = useState("")

  const units = useMemo(() => Object.keys(unitData[category]), [category])

  useEffect(() => {
    setFromUnit(units[0])
    setToUnit(units[1] || units[0])
    setFromValue("1")
  }, [category, units])

  const result = useMemo(() => {
    const num = parseFloat(fromValue)
    if (isNaN(num)) return ""
    const converted = convertUnit(num, fromUnit, toUnit, category)
    return isNaN(converted) ? "" : converted.toPrecision(10).replace(/\.?0+$/, "")
  }, [fromValue, fromUnit, toUnit, category])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {unitCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id as UnitCategory)}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              category === cat.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground block">From</label>
          <Input
            type="number"
            value={fromValue}
            onChange={(e) => setFromValue(e.target.value)}
            className="bg-background/50 font-mono"
          />
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="w-full h-9 px-3 rounded-md border border-border bg-background/50 text-foreground text-sm"
          >
            {units.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground block">To</label>
          <div className="h-9 flex items-center px-3 rounded-md border border-border bg-muted/30 font-mono text-foreground text-lg">
            {result || "—"}
          </div>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="w-full h-9 px-3 rounded-md border border-border bg-background/50 text-foreground text-sm"
          >
            {units.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>

      {fromValue && result && (
        <div className="text-sm text-muted-foreground bg-muted/30 border border-border/50 rounded-lg p-3">
          {fromValue} {fromUnit} = {result} {toUnit}
        </div>
      )}
    </div>
  )
}