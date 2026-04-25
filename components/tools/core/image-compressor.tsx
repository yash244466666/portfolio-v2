"use client"

import { useState, useCallback } from "react"
import { ToolResult } from "@/components/tools/shared/tool-result"
import { Button } from "@/components/ui/button"
import Dropzone from "@/components/tools/shared/dropzone"

export default function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null)
  const [quality, setQuality] = useState(0.8)
  const [maxWidth, setMaxWidth] = useState(1920)
  const [compressedUrl, setCompressedUrl] = useState("")
  const [originalSize, setOriginalSize] = useState(0)
  const [compressedSize, setCompressedSize] = useState(0)
  const [loading, setLoading] = useState(false)

  const compress = useCallback(async () => {
    if (!file) return
    setLoading(true)

    try {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.src = url

      await new Promise((resolve) => { img.onload = resolve })

      let w = img.width
      let h = img.height
      if (w > maxWidth) {
        h = Math.round((h * maxWidth) / w)
        w = maxWidth
      }

      const canvas = document.createElement("canvas")
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext("2d")!
      ctx.drawImage(img, 0, 0, w, h)

      const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg"
      canvas.toBlob(
        (blob) => {
          if (!blob) return
          const compressed = URL.createObjectURL(blob)
          setCompressedUrl(compressed)
          setCompressedSize(blob.size)
          setOriginalSize(file.size)
          setLoading(false)
          URL.revokeObjectURL(url)
        },
        mimeType,
        mimeType === "image/jpeg" ? quality : undefined
      )
    } catch {
      setLoading(false)
    }
  }, [file, quality, maxWidth])

  const download = () => {
    if (!compressedUrl) return
    const a = document.createElement("a")
    a.href = compressedUrl
    a.download = `compressed-${file?.name || "image"}`
    a.click()
  }

  const formatSize = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(2)} MB`
  const savings = originalSize > 0 ? Math.round((1 - compressedSize / originalSize) * 100) : 0

  return (
    <div className="space-y-6">
      <Dropzone
        onFiles={(files) => { setFile(files[0] || null); setCompressedUrl(""); }}
        accept="image/png,image/jpeg,image/webp"
        label="Drop an image here or click to browse (PNG, JPG, WebP)"
      />

      {file && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{file.name} ({formatSize(file.size)})</p>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Quality</label>
              <span className="text-sm text-muted-foreground">{Math.round(quality * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Max Width (px)</label>
            <div className="flex gap-2">
              {[800, 1280, 1920, 2560].map((w) => (
                <button
                  key={w}
                  onClick={() => setMaxWidth(w)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${maxWidth === w ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={compress} disabled={loading} className="w-full">
            {loading ? "Compressing..." : "Compress Image"}
          </Button>

          {compressedUrl && (
            <ToolResult className="    space-y-3">
              <div className="flex gap-4 text-sm">
                <span className="text-muted-foreground">Original: {formatSize(originalSize)}</span>
                <span className="text-muted-foreground">Compressed: {formatSize(compressedSize)}</span>
                <span className={savings > 0 ? "text-emerald-400" : "text-amber-400"}>
                  {savings > 0 ? `${savings}% smaller` : "No savings"}
                </span>
              </div>
              <div className="border border-border/50 rounded-lg overflow-hidden">
                <img src={compressedUrl} alt="Compressed" className="max-w-full h-auto" />
              </div>
              <Button onClick={download} variant="outline" className="w-full">
                Download Compressed Image
              </Button>
            </ToolResult>
          )}
        </div>
      )}
    </div>
  )
}