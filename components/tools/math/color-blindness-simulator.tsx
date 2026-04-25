"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { simulateColorBlindness, colorBlindnessTypes } from "@/lib/tools/color-blindness"

export default function ColorBlindnessSimulator() {
  const [hexColor, setHexColor] = useState("#4287f5")
  const [selectedType, setSelectedType] = useState("protanopia")

  const rgb = useMemo(() => {
    const hex = hexColor.replace("#", "")
    if (hex.length !== 6) return null
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null
    return { r, g, b }
  }, [hexColor])

  const simulated = useMemo(() => {
    if (!rgb) return null
    return simulateColorBlindness(rgb.r, rgb.g, rgb.b, selectedType)
  }, [rgb, selectedType])

  const toHex = (r: number, g: number, b: number) => {
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      {/* Color input */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <input
            type="color"
            value={hexColor}
            onChange={(e) => setHexColor(e.target.value)}
            className="w-12 h-12 rounded-lg border border-border cursor-pointer bg-transparent"
          />
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium text-foreground block mb-1">
            Hex Color
          </label>
          <Input
            value={hexColor}
            onChange={(e) => {
              const val = e.target.value
              setHexColor(val.startsWith("#") ? val : `#${val}`)
            }}
            placeholder="#4287f5"
            className="font-mono"
            maxLength={7}
          />
        </div>
      </div>

      {/* Blindness type selector */}
      <div className="flex flex-wrap gap-2">
        {colorBlindnessTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
              selectedType === type.id
                ? "bg-primary/10 border-primary/30 text-primary"
                : "border-border text-muted-foreground hover:border-primary/50"
            }`}
          >
            <span className="font-medium">{type.label}</span>
            <span className="block text-xs opacity-60">{type.description}</span>
          </button>
        ))}
      </div>

      {/* Side by side comparison */}
      {rgb && simulated && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/30 border border-border/50 rounded-xl overflow-hidden">
            <div
              className="h-32"
              style={{ backgroundColor: hexColor }}
            />
            <div className="p-3 space-y-1">
              <p className="text-sm font-medium text-foreground">Original</p>
              <p className="text-xs font-mono text-muted-foreground">
                RGB({rgb.r}, {rgb.g}, {rgb.b})
              </p>
              <p className="text-xs font-mono text-muted-foreground">
                {hexColor.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="bg-muted/30 border border-border/50 rounded-xl overflow-hidden">
            <div
              className="h-32"
              style={{
                backgroundColor: toHex(simulated.r, simulated.g, simulated.b),
              }}
            />
            <div className="p-3 space-y-1">
              <p className="text-sm font-medium text-foreground">
                {colorBlindnessTypes.find((t) => t.id === selectedType)?.label}
              </p>
              <p className="text-xs font-mono text-muted-foreground">
                RGB({simulated.r}, {simulated.g}, {simulated.b})
              </p>
              <p className="text-xs font-mono text-muted-foreground">
                {toHex(simulated.r, simulated.g, simulated.b).toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* All types comparison */}
      {rgb && (
        <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
          <span className="text-sm font-medium text-foreground block mb-3">
            All Types
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {colorBlindnessTypes.map((type) => {
              const sim = simulateColorBlindness(rgb.r, rgb.g, rgb.b, type.id)
              return (
                <div key={type.id} className="text-center">
                  <div
                    className="h-16 rounded-lg mb-2"
                    style={{
                      backgroundColor: toHex(sim.r, sim.g, sim.b),
                    }}
                  />
                  <p className="text-xs font-medium text-foreground">{type.label}</p>
                  <p className="text-xs font-mono text-muted-foreground">
                    {toHex(sim.r, sim.g, sim.b).toUpperCase()}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}