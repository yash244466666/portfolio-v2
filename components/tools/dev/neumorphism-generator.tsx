"use client"

import { useState, useMemo } from "react"
import { ToolResult } from "@/components/tools/shared/tool-result"
import { Input } from "@/components/ui/input"
import CopyButton from "@/components/tools/shared/copy-button"

type ShapeType = "flat" | "convex" | "concave" | "pressed"

const shapes: { id: ShapeType; label: string }[] = [
  { id: "flat", label: "Flat" },
  { id: "convex", label: "Convex" },
  { id: "concave", label: "Concave" },
  { id: "pressed", label: "Pressed" },
]

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 200, g: 200, b: 200 }
}

function lighten(hex: string, amount: number) {
  const rgb = hexToRgb(hex)
  return `rgb(${Math.min(255, rgb.r + amount)}, ${Math.min(255, rgb.g + amount)}, ${Math.min(255, rgb.b + amount)})`
}

function darken(hex: string, amount: number) {
  const rgb = hexToRgb(hex)
  return `rgb(${Math.max(0, rgb.r - amount)}, ${Math.max(0, rgb.g - amount)}, ${Math.max(0, rgb.b - amount)})`
}

export default function NeumorphismGenerator() {
  const [size, setSize] = useState(150)
  const [radius, setRadius] = useState(30)
  const [distance, setDistance] = useState(8)
  const [intensity, setIntensity] = useState(30)
  const [baseColor, setBaseColor] = useState("#2a2a2a")
  const [shape, setShape] = useState<ShapeType>("convex")

  const { previewStyle, cssCode } = useMemo(() => {
    const light = lighten(baseColor, intensity)
    const dark = darken(baseColor, intensity)

    const base: React.CSSProperties = {
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: `${radius}%`,
      background: baseColor,
    }

    let css = `.neumorphic {\n  width: ${size}px;\n  height: ${size}px;\n  border-radius: ${radius}%;\n  background: ${baseColor};`

    switch (shape) {
      case "flat":
        return {
          previewStyle: {
            ...base,
            boxShadow: `${distance}px ${distance}px ${distance * 2}px ${dark}, -${distance}px -${distance}px ${distance * 2}px ${light}`,
          },
          cssCode: css + `\n  box-shadow: ${distance}px ${distance}px ${distance * 2}px ${dark}, -${distance}px -${distance}px ${distance * 2}px ${light};\n}`,
        }
      case "convex":
        return {
          previewStyle: {
            ...base,
            background: `linear-gradient(145deg, ${lighten(baseColor, intensity * 0.4)}, ${darken(baseColor, intensity * 0.4)})`,
            boxShadow: `${distance}px ${distance}px ${distance * 2}px ${dark}, -${distance}px -${distance}px ${distance * 2}px ${light}`,
          },
          cssCode: css + `\n  background: linear-gradient(145deg, ${lighten(baseColor, intensity * 0.4)}, ${darken(baseColor, intensity * 0.4)});\n  box-shadow: ${distance}px ${distance}px ${distance * 2}px ${dark}, -${distance}px -${distance}px ${distance * 2}px ${light};\n}`,
        }
      case "concave":
        return {
          previewStyle: {
            ...base,
            background: `linear-gradient(145deg, ${darken(baseColor, intensity * 0.4)}, ${lighten(baseColor, intensity * 0.4)})`,
            boxShadow: `inset ${distance}px ${distance}px ${distance * 2}px ${dark}, inset -${distance}px -${distance}px ${distance * 2}px ${light}`,
          },
          cssCode: css + `\n  background: linear-gradient(145deg, ${darken(baseColor, intensity * 0.4)}, ${lighten(baseColor, intensity * 0.4)});\n  box-shadow: inset ${distance}px ${distance}px ${distance * 2}px ${dark}, inset -${distance}px -${distance}px ${distance * 2}px ${light};\n}`,
        }
      case "pressed":
        return {
          previewStyle: {
            ...base,
            boxShadow: `inset ${distance}px ${distance}px ${distance * 2}px ${dark}, inset -${distance}px -${distance}px ${distance * 2}px ${light}`,
          },
          cssCode: css + `\n  box-shadow: inset ${distance}px ${distance}px ${distance * 2}px ${dark}, inset -${distance}px -${distance}px ${distance * 2}px ${light};\n}`,
        }
    }
  }, [size, radius, distance, intensity, baseColor, shape])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center py-8">
        <div style={previewStyle} className="flex items-center justify-center">
          <span className="text-foreground/70 text-sm font-medium">Preview</span>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Shape</label>
        <div className="flex flex-wrap gap-2">
          {shapes.map((s) => (
            <button
              key={s.id}
              onClick={() => setShape(s.id)}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                shape === s.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Base Color</label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
            <Input value={baseColor} onChange={(e) => setBaseColor(e.target.value)} className="font-mono bg-background/50" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Size</label>
            <span className="text-sm text-muted-foreground">{size}px</span>
          </div>
          <input
            type="range"
            min={80}
            max={250}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Border Radius</label>
            <span className="text-sm text-muted-foreground">{radius}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={50}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Distance</label>
            <span className="text-sm text-muted-foreground">{distance}px</span>
          </div>
          <input
            type="range"
            min={2}
            max={30}
            value={distance}
            onChange={(e) => setDistance(Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Intensity</label>
            <span className="text-sm text-muted-foreground">{intensity}</span>
          </div>
          <input
            type="range"
            min={5}
            max={60}
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
          />
        </div>
      </div>

      <ToolResult className="    relative">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-muted-foreground">CSS</p>
          <CopyButton text={cssCode} />
        </div>
        <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">{cssCode}</pre>
      </ToolResult>
    </div>
  )
}