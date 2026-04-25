"use client"

import { useState, useMemo } from "react"
import { ToolResult } from "@/components/tools/shared/tool-result"
import { Input } from "@/components/ui/input"
import CopyButton from "@/components/tools/shared/copy-button"

export default function GradientBorderGenerator() {
  const [startColor, setStartColor] = useState("#6366f1")
  const [endColor, setEndColor] = useState("#06b6d4")
  const [angle, setAngle] = useState(135)
  const [borderWidth, setBorderWidth] = useState(3)
  const [borderRadius, setBorderRadius] = useState(12)

  const cssCode = useMemo(() => {
    return `.gradient-border {
  position: relative;
  background: hsl(0 0% 100%);
  border-radius: ${borderRadius}px;
  padding: 1rem;
}

.gradient-border::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: ${borderRadius}px;
  padding: ${borderWidth}px;
  background: linear-gradient(${angle}deg, ${startColor}, ${endColor});
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}`
  }, [startColor, endColor, angle, borderWidth, borderRadius])

  const previewStyle: React.CSSProperties = {
    position: "relative",
    background: "var(--background, #0a0a0a)",
    borderRadius: `${borderRadius}px`,
    padding: "2rem",
  }

  const beforeStyle: React.CSSProperties = {
    content: '""',
    position: "absolute" as const,
    inset: 0,
    borderRadius: `${borderRadius}px`,
    padding: `${borderWidth}px`,
    background: `linear-gradient(${angle}deg, ${startColor}, ${endColor})`,
    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
    WebkitMaskComposite: "xor",
    maskComposite: "exclude" as const,
    pointerEvents: "none" as const,
  }

  return (
    <div className="space-y-6">
      <div
        className="rounded-xl border border-border/50 overflow-hidden"
        style={previewStyle}
      >
        <div style={beforeStyle} />
        <div className="relative z-10 text-center">
          <p className="text-foreground text-lg font-medium">Gradient Border Preview</p>
          <p className="text-muted-foreground text-sm mt-1">Customize the gradient, width, and radius</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Start Color</label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={startColor}
              onChange={(e) => setStartColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
            <Input value={startColor} onChange={(e) => setStartColor(e.target.value)} className="font-mono bg-background/50" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-2">End Color</label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={endColor}
              onChange={(e) => setEndColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
            <Input value={endColor} onChange={(e) => setEndColor(e.target.value)} className="font-mono bg-background/50" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Angle</label>
            <span className="text-sm text-muted-foreground">{angle}&deg;</span>
          </div>
          <input
            type="range"
            min={0}
            max={360}
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Border Width</label>
            <span className="text-sm text-muted-foreground">{borderWidth}px</span>
          </div>
          <input
            type="range"
            min={1}
            max={20}
            value={borderWidth}
            onChange={(e) => setBorderWidth(Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div className="sm:col-span-2">
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

      <ToolResult className="    relative">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-muted-foreground">CSS</p>
          <CopyButton text={cssCode} />
        </div>
        <pre className="text-sm font-mono text-foreground whitespace-pre-wrap break-all">{cssCode}</pre>
      </ToolResult>
    </div>
  )
}