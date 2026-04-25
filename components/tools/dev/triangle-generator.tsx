"use client"

import { useState, useMemo } from "react"
import CopyButton from "@/components/tools/shared/copy-button"

const directions = [
  { id: "up", label: "Up" },
  { id: "down", label: "Down" },
  { id: "left", label: "Left" },
  { id: "right", label: "Right" },
]

export default function TriangleGenerator() {
  const [direction, setDirection] = useState("up")
  const [width, setWidth] = useState(100)
  const [height, setHeight] = useState(100)
  const [color, setColor] = useState("#6366f1")

  const cssCode = useMemo(() => {
    const halfW = width / 2
    const halfH = height / 2
    const transparent = "transparent"

    switch (direction) {
      case "up":
        return `width: 0;\nheight: 0;\nborder-left: ${halfW}px solid ${transparent};\nborder-right: ${halfW}px solid ${transparent};\nborder-bottom: ${height}px solid ${color};`
      case "down":
        return `width: 0;\nheight: 0;\nborder-left: ${halfW}px solid ${transparent};\nborder-right: ${halfW}px solid ${transparent};\nborder-top: ${height}px solid ${color};`
      case "left":
        return `width: 0;\nheight: 0;\nborder-top: ${halfH}px solid ${transparent};\nborder-bottom: ${halfH}px solid ${transparent};\nborder-right: ${width}px solid ${color};`
      case "right":
        return `width: 0;\nheight: 0;\nborder-top: ${halfH}px solid ${transparent};\nborder-bottom: ${halfH}px solid ${transparent};\nborder-left: ${width}px solid ${color};`
      default:
        return ""
    }
  }, [direction, width, height, color])

  const previewStyle = useMemo(() => {
    const halfW = width / 2
    const halfH = height / 2
    const transparent = "transparent"
    const base: React.CSSProperties = { width: 0, height: 0 }

    switch (direction) {
      case "up":
        return {
          ...base,
          borderLeft: `${halfW}px solid ${transparent}`,
          borderRight: `${halfW}px solid ${transparent}`,
          borderBottom: `${height}px solid ${color}`,
        }
      case "down":
        return {
          ...base,
          borderLeft: `${halfW}px solid ${transparent}`,
          borderRight: `${halfW}px solid ${transparent}`,
          borderTop: `${height}px solid ${color}`,
        }
      case "left":
        return {
          ...base,
          borderTop: `${halfH}px solid ${transparent}`,
          borderBottom: `${halfH}px solid ${transparent}`,
          borderRight: `${width}px solid ${color}`,
        }
      case "right":
        return {
          ...base,
          borderTop: `${halfH}px solid ${transparent}`,
          borderBottom: `${halfH}px solid ${transparent}`,
          borderLeft: `${width}px solid ${color}`,
        }
      default:
        return base
    }
  }, [direction, width, height, color])

  return (
    <div className="space-y-6">
      <div className="w-full h-64 rounded-xl border border-border/50 bg-background/50 flex items-center justify-center">
        <div style={previewStyle} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Direction</label>
          <div className="flex gap-1">
            {directions.map((d) => (
              <button
                key={d.id}
                onClick={() => setDirection(d.id)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  direction === d.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Color</label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
            <span className="text-sm font-mono text-muted-foreground">{color}</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Width</label>
            <span className="text-sm text-muted-foreground">{width}px</span>
          </div>
          <input
            type="range"
            min={10}
            max={300}
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Height</label>
            <span className="text-sm text-muted-foreground">{height}px</span>
          </div>
          <input
            type="range"
            min={10}
            max={300}
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
          />
        </div>
      </div>

      <div className="bg-muted/30 border border-border/50 rounded-lg p-4 relative">
        <p className="text-xs text-muted-foreground mb-1">CSS</p>
        <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">{cssCode}</pre>
        <div className="absolute top-3 right-3"><CopyButton text={cssCode} /></div>
      </div>
    </div>
  )
}