"use client"

import { useState, useMemo } from "react"
import { ToolResult } from "@/components/tools/shared/tool-result"
import CopyButton from "@/components/tools/shared/copy-button"

const units = [
  { id: "px", label: "px" },
  { id: "%", label: "%" },
  { id: "rem", label: "rem" },
]

export default function BorderRadiusGenerator() {
  const [topLeft, setTopLeft] = useState(16)
  const [topRight, setTopRight] = useState(16)
  const [bottomRight, setBottomRight] = useState(16)
  const [bottomLeft, setBottomLeft] = useState(16)
  const [linked, setLinked] = useState(false)
  const [unit, setUnit] = useState("px")

  const handleCornerChange = (setter: (v: number) => void, value: number) => {
    setter(value)
    if (linked) {
      setTopLeft(value)
      setTopRight(value)
      setBottomRight(value)
      setBottomLeft(value)
    }
  }

  const maxVal = unit === "%" ? 50 : unit === "rem" ? 10 : 100

  const borderRadius = useMemo(() => {
    const vals = [topLeft, topRight, bottomRight, bottomLeft]
    if (vals.every((v) => v === topLeft)) {
      return `border-radius: ${topLeft}${unit};`
    }
    return `border-radius: ${topLeft}${unit} ${topRight}${unit} ${bottomRight}${unit} ${bottomLeft}${unit};`
  }, [topLeft, topRight, bottomRight, bottomLeft, unit])

  const previewStyle = useMemo(() => {
    const vals = [topLeft, topRight, bottomRight, bottomLeft]
    if (vals.every((v) => v === topLeft)) {
      return { borderRadius: `${topLeft}${unit}` }
    }
    return {
      borderTopLeftRadius: `${topLeft}${unit}`,
      borderTopRightRadius: `${topRight}${unit}`,
      borderBottomRightRadius: `${bottomRight}${unit}`,
      borderBottomLeftRadius: `${bottomLeft}${unit}`,
    }
  }, [topLeft, topRight, bottomRight, bottomLeft, unit])

  return (
    <div className="space-y-6">
      <div
        className="w-full h-48 sm:h-64 rounded-xl border border-border/50 bg-primary/20"
        style={previewStyle}
      />

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">Unit:</label>
          <div className="flex gap-1">
            {units.map((u) => (
              <button
                key={u.id}
                onClick={() => setUnit(u.id)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  unit === u.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={linked}
            onChange={(e) => setLinked(e.target.checked)}
            className="rounded border-border accent-primary"
          />
          Link corners
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Top Left", value: topLeft, setter: setTopLeft },
          { label: "Top Right", value: topRight, setter: setTopRight },
          { label: "Bottom Right", value: bottomRight, setter: setBottomRight },
          { label: "Bottom Left", value: bottomLeft, setter: setBottomLeft },
        ].map(({ label, value, setter }) => (
          <div key={label}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">{label}</label>
              <span className="text-sm text-muted-foreground">{value}{unit}</span>
            </div>
            <input
              type="range"
              min={0}
              max={maxVal}
              value={value}
              onChange={(e) => handleCornerChange(setter, Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
            />
          </div>
        ))}
      </div>

      <ToolResult className="    relative">
        <p className="text-xs text-muted-foreground mb-1">CSS</p>
        <code className="text-sm font-mono text-foreground break-all">{borderRadius}</code>
        <div className="absolute top-3 right-3"><CopyButton text={borderRadius} /></div>
      </ToolResult>
    </div>
  )
}