"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import CopyButton from "@/components/tools/shared/copy-button"

export default function GlassmorphismGenerator() {
  const [blur, setBlur] = useState(10)
  const [opacity, setOpacity] = useState(0.2)
  const [bgColor, setBgColor] = useState("#ffffff")
  const [borderColor, setBorderColor] = useState("#ffffff")
  const [borderWidth, setBorderWidth] = useState(1)
  const [borderRadius, setBorderRadius] = useState(16)

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
      : { r: 255, g: 255, b: 255 }
  }

  const cssCode = useMemo(() => {
    const rgb = hexToRgb(bgColor)
    return `.glass {
  background: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity});
  backdrop-filter: blur(${blur}px);
  -webkit-backdrop-filter: blur(${blur}px);
  border: ${borderWidth}px solid ${borderColor};
  border-radius: ${borderRadius}px;
}`
  }, [blur, opacity, bgColor, borderColor, borderWidth, borderRadius])

  const previewStyle: React.CSSProperties = {
    background: `rgba(${hexToRgb(bgColor).r}, ${hexToRgb(bgColor).g}, ${hexToRgb(bgColor).b}, ${opacity})`,
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    border: `${borderWidth}px solid ${borderColor}`,
    borderRadius: `${borderRadius}px`,
  }

  return (
    <div className="space-y-6">
      <div
        className="w-full h-64 rounded-xl overflow-hidden relative"
        style={{
          background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 40%, #f59e0b 70%, #ef4444 100%)",
        }}
      >
        <div className="absolute inset-8 flex items-center justify-center" style={previewStyle}>
          <p className="text-foreground font-medium text-lg">Glassmorphism</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Blur</label>
            <span className="text-sm text-muted-foreground">{blur}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={40}
            value={blur}
            onChange={(e) => setBlur(Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
          />
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

        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Background Color</label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
            <Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="font-mono bg-background/50" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Border Color</label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={borderColor}
              onChange={(e) => setBorderColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
            <Input value={borderColor} onChange={(e) => setBorderColor(e.target.value)} className="font-mono bg-background/50" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Border Width</label>
            <span className="text-sm text-muted-foreground">{borderWidth}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={5}
            value={borderWidth}
            onChange={(e) => setBorderWidth(Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Border Radius</label>
            <span className="text-sm text-muted-foreground">{borderRadius}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={50}
            value={borderRadius}
            onChange={(e) => setBorderRadius(Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
          />
        </div>
      </div>

      <div className="bg-muted/30 border border-border/50 rounded-lg p-4 relative">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-muted-foreground">CSS</p>
          <CopyButton text={cssCode} />
        </div>
        <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">{cssCode}</pre>
      </div>
    </div>
  )
}