"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import CopyButton from "@/components/tools/shared/copy-button"

type GradientType = "linear" | "radial" | "conic"

export default function CssGradientGenerator() {
  const [type, setType] = useState<GradientType>("linear")
  const [angle, setAngle] = useState(135)
  const [color1, setColor1] = useState("#6366f1")
  const [color2, setColor2] = useState("#06b6d4")
  const [color3, setColor3] = useState("")

  const gradient = useMemo(() => {
    const stops = [color1, color2, color3].filter(Boolean).join(", ")
    switch (type) {
      case "linear": return `linear-gradient(${angle}deg, ${stops})`
      case "radial": return `radial-gradient(circle, ${stops})`
      case "conic": return `conic-gradient(from ${angle}deg, ${stops})`
    }
  }, [type, angle, color1, color2, color3])

  const cssCode = `background: ${gradient};`

  return (
    <div className="space-y-6">
      <div
        className="w-full h-48 sm:h-64 rounded-xl border border-border/50"
        style={{ background: gradient }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Type</label>
          <div className="flex gap-2">
            {(["linear", "radial", "conic"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded-md text-sm capitalize transition-colors ${type === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {(type === "linear" || type === "conic") && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Angle</label>
              <span className="text-sm text-muted-foreground">{angle}°</span>
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
        )}

        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Color 1</label>
          <div className="flex gap-2 items-center">
            <input type="color" value={color1} onChange={(e) => setColor1(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
            <Input value={color1} onChange={(e) => setColor1(e.target.value)} className="font-mono bg-background/50" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Color 2</label>
          <div className="flex gap-2 items-center">
            <input type="color" value={color2} onChange={(e) => setColor2(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
            <Input value={color2} onChange={(e) => setColor2(e.target.value)} className="font-mono bg-background/50" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Color 3 (optional)</label>
          <div className="flex gap-2 items-center">
            <input type="color" value={color3 || "#000000"} onChange={(e) => setColor3(e.target.value)} className="w-10 h-10 rounded cursor-pointer" disabled={!color3} />
            <Input value={color3} onChange={(e) => setColor3(e.target.value)} placeholder="Optional" className="font-mono bg-background/50" />
          </div>
          <button onClick={() => setColor3(color3 ? "" : "#f59e0b")} className="text-xs text-primary mt-1">
            {color3 ? "Remove" : "Add third color"}
          </button>
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