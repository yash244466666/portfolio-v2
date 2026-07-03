"use client"

import { useState, useMemo, useEffect } from "react"
import { ToolResult } from "@/components/tools/shared/tool-result"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import CopyButton from "@/components/tools/shared/copy-button"
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
            className="font-mono"
          />
          <Select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
          >
            {units.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </Select>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground block flex justify-between">
            <span>To</span>
            <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">Result</span>
          </label>
          <div className="relative">
            <Input
              type="text"
              readOnly
              value={result || "—"}
              className="font-mono pr-12 bg-muted/20 border-dashed"
            />
            {result && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <CopyButton text={result} iconOnly />
              </div>
            )}
          </div>
          <Select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
          >
            {units.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </Select>
        </div>
      </div>

      {fromValue && result && (
        <ToolResult 
          label="Formula" 
          className="mt-6"
          copyValue={`${fromValue} ${fromUnit} = ${result} ${toUnit}`}
        >
          {fromValue} {fromUnit} = {result} {toUnit}
        </ToolResult>
      )}
    </div>
  )
}