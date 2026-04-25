"use client"

import { useState, useCallback } from "react"
import { hexToRgb, rgbToHex } from "@/lib/tools/color-utils"
import Dropzone from "@/components/tools/shared/dropzone"
import CopyButton from "@/components/tools/shared/copy-button"

function extractColors(imageData: ImageData, count: number): string[] {
  const data = imageData.data
  const colorMap: Record<string, number> = {}

  for (let i = 0; i < data.length; i += 16) {
    const r = data[i], g = data[i + 1], b = data[i + 2]
    const qr = Math.round(r / 32) * 32
    const qg = Math.round(g / 32) * 32
    const qb = Math.round(b / 32) * 32
    const key = `${qr},${qg},${qb}`
    colorMap[key] = (colorMap[key] || 0) + 1
  }

  return Object.entries(colorMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([key]) => {
      const [r, g, b] = key.split(",").map(Number)
      return rgbToHex(r, g, b)
    })
}

export default function ColorPaletteFromImage() {
  const [palette, setPalette] = useState<string[]>([])
  const [imagePreview, setImagePreview] = useState("")
  const [loading, setLoading] = useState(false)

  const handleFile = useCallback((files: File[]) => {
    const file = files[0]
    if (!file) return
    setLoading(true)

    const img = new Image()
    const url = URL.createObjectURL(file)
    img.src = url
    setImagePreview(url)

    img.onload = () => {
      const canvas = document.createElement("canvas")
      const size = 100
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext("2d")!
      ctx.drawImage(img, 0, 0, size, size)
      const imageData = ctx.getImageData(0, 0, size, size)
      const colors = extractColors(imageData, 8)
      setPalette(colors)
      setLoading(false)
    }
  }, [])

  return (
    <div className="space-y-6">
      <Dropzone
        onFiles={handleFile}
        accept="image/*"
        label="Drop an image here to extract its colors"
      />

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )}

      {imagePreview && (
        <div className="border border-border/50 rounded-lg overflow-hidden max-w-xs">
          <img src={imagePreview} alt="Uploaded" className="w-full h-auto" />
        </div>
      )}

      {palette.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Extracted Palette</h3>
          <div className="flex flex-wrap gap-3">
            {palette.map((color, i) => {
              const rgb = hexToRgb(color)
              const luminance = rgb ? (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255 : 0
              const textColor = luminance > 0.5 ? "text-black" : "text-white"
              return (
                <div key={i} className="group relative">
                  <div
                    className="w-16 h-16 rounded-xl border border-border/50 cursor-pointer flex items-center justify-center"
                    style={{ backgroundColor: color }}
                    onClick={() => navigator.clipboard.writeText(color)}
                  >
                    <span className={`text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity ${textColor}`}>
                      Copy
                    </span>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground text-center mt-1">{color}</p>
                </div>
              )
            })}
          </div>
          <div className="mt-4">
            <CopyButton text={palette.join(", ")} />
            <span className="text-xs text-muted-foreground ml-2">Copy all as CSS variables</span>
          </div>
          <div className="mt-2 bg-muted/30 border border-border/50 rounded-lg p-3">
            <pre className="font-mono text-xs text-foreground">{palette.map((c, i) => `  --color-${i + 1}: ${c};`).join("\n")}</pre>
          </div>
        </div>
      )}
    </div>
  )
}