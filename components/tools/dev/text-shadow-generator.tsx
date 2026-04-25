"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import CopyButton from "@/components/tools/shared/copy-button"

interface ShadowLayer {
  id: string
  offsetX: number
  offsetY: number
  blur: number
  color: string
}

let layerCounter = 0

function createLayer(): ShadowLayer {
  return {
    id: `layer-${++layerCounter}`,
    offsetX: 2,
    offsetY: 2,
    blur: 4,
    color: "#6366f1",
  }
}

export default function TextShadowGenerator() {
  const [layers, setLayers] = useState<ShadowLayer[]>([createLayer()])
  const [previewText, setPreviewText] = useState("Text Shadow")

  const textShadow = useMemo(
    () =>
      layers
        .map((l) => `${l.offsetX}px ${l.offsetY}px ${l.blur}px ${l.color}`)
        .join(", "),
    [layers]
  )

  const cssCode = `text-shadow: ${textShadow};`

  const updateLayer = (id: string, field: keyof ShadowLayer, value: number | string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    )
  }

  const addLayer = () => {
    setLayers((prev) => [...prev, createLayer()])
  }

  const removeLayer = (id: string) => {
    setLayers((prev) => prev.filter((l) => l.id !== id))
  }

  return (
    <div className="space-y-6">
      <div
        className="w-full h-48 sm:h-64 rounded-xl border border-border/50 bg-background/50 flex items-center justify-center"
        style={{ textShadow }}
      >
        <span className="text-4xl sm:text-5xl font-bold text-foreground">{previewText}</span>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Preview Text</label>
        <input
          value={previewText}
          onChange={(e) => setPreviewText(e.target.value)}
          className="w-full h-9 px-3 rounded-md border border-border bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          placeholder="Preview text"
        />
      </div>

      <div className="space-y-4">
        {layers.map((layer, index) => (
          <div key={layer.id} className="p-4 rounded-lg border border-border/50 bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Layer {index + 1}</span>
              {layers.length > 1 && (
                <Button onClick={() => removeLayer(layer.id)} variant="ghost" size="sm" className="h-7 text-xs text-red-400 hover:text-red-300">
                  Remove
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-muted-foreground">Offset X</label>
                  <span className="text-xs text-muted-foreground">{layer.offsetX}px</span>
                </div>
                <input
                  type="range"
                  min={-20}
                  max={20}
                  value={layer.offsetX}
                  onChange={(e) => updateLayer(layer.id, "offsetX", Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-muted-foreground">Offset Y</label>
                  <span className="text-xs text-muted-foreground">{layer.offsetY}px</span>
                </div>
                <input
                  type="range"
                  min={-20}
                  max={20}
                  value={layer.offsetY}
                  onChange={(e) => updateLayer(layer.id, "offsetY", Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-muted-foreground">Blur</label>
                  <span className="text-xs text-muted-foreground">{layer.blur}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={30}
                  value={layer.blur}
                  onChange={(e) => updateLayer(layer.id, "blur", Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={layer.color}
                    onChange={(e) => updateLayer(layer.id, "color", e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                  <span className="text-xs font-mono text-muted-foreground">{layer.color}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        <Button onClick={addLayer} variant="outline" size="sm">Add Shadow Layer</Button>
      </div>

      <div className="bg-muted/30 border border-border/50 rounded-lg p-4 relative">
        <p className="text-xs text-muted-foreground mb-1">CSS</p>
        <code className="text-sm font-mono text-foreground break-all">{cssCode}</code>
        <div className="absolute top-3 right-3"><CopyButton text={cssCode} /></div>
      </div>
    </div>
  )
}