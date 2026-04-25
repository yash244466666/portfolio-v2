"use client"

import { useState, useMemo } from "react"
import CopyButton from "@/components/tools/shared/copy-button"

export default function BoxShadowGenerator() {
  const [offsetX, setOffsetX] = useState(4)
  const [offsetY, setOffsetY] = useState(4)
  const [blur, setBlur] = useState(12)
  const [spread, setSpread] = useState(0)
  const [color, setColor] = useState("#6366f1")
  const [opacity, setOpacity] = useState(0.3)

  const hexToRgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  const boxShadow = useMemo(
    () => `${offsetX}px ${offsetY}px ${blur}px ${spread}px ${hexToRgba(color, opacity)}`,
    [offsetX, offsetY, blur, spread, color, opacity]
  )

  const cssCode = `box-shadow: ${boxShadow};`

  return (
    <div className="space-y-6">
      <div
        className="w-full h-48 sm:h-64 rounded-xl border border-border/50 bg-background/50 flex items-center justify-center"
        style={{ boxShadow }}
      >
        <span className="text-muted-foreground text-sm">Preview</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Offset X</label>
            <span className="text-sm text-muted-foreground">{offsetX}px</span>
          </div>
          <input
            type="range"
            min={-50}
            max={50}
            value={offsetX}
            onChange={(e) => setOffsetX(Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Offset Y</label>
            <span className="text-sm text-muted-foreground">{offsetY}px</span>
          </div>
          <input
            type="range"
            min={-50}
            max={50}
            value={offsetY}
            onChange={(e) => setOffsetY(Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Blur</label>
            <span className="text-sm text-muted-foreground">{blur}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={blur}
            onChange={(e) => setBlur(Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Spread</label>
            <span className="text-sm text-muted-foreground">{spread}px</span>
          </div>
          <input
            type="range"
            min={-50}
            max={50}
            value={spread}
            onChange={(e) => setSpread(Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
          />
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
            <label className="text-sm font-medium text-foreground">Opacity</label>
            <span className="text-sm text-muted-foreground">{(opacity * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
          />
        </div>
      </div>

      <div className="bg-muted/30 border border-border/50 rounded-lg p-4 relative">
        <p className="text-xs text-muted-foreground mb-1">CSS</p>
        <code className="text-sm font-mono text-foreground break-all">{cssCode}</code>
        <div className="absolute top-3 right-3"><CopyButton text={cssCode} /></div>
      </div>
    </div>
  )
}